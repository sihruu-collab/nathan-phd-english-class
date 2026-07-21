document.addEventListener("DOMContentLoaded", async function () {
  "use strict";

  // TODO: replace with your real Toss Payments client key.
  // This is a PUBLIC key (like a Stripe publishable key) - it is meant to be
  // embedded in frontend code. Get a free test key at developers.tosspayments.com,
  // then swap in your live client key once your merchant contract is approved.
  var TOSS_CLIENT_KEY = "test_ck_DLJOpm5QrlWbR2bgNlNeVPNdxbWn";

  // Top-level service -> which duration variants it offers. Only 회화 수업
  // has a 30-minute option; the others just have the standard 1-hour format.
  // Each duration's "key" is the PRICES lookup key sent to the server.
  var SERVICES = {
    conversation: {
      label: "회화 수업",
      durations: [
        { key: "conversation", label: "1시간 수업 (50분 진행)" },
        { key: "conversation_30min", label: "30분 수업 (25분 진행)" },
      ],
    },
    writing: {
      label: "작문 & 에세이 코칭",
      durations: [{ key: "writing", label: "1시간 수업 (50분 진행)" }],
    },
    literature: {
      label: "문학 & 정독 세미나",
      durations: [{ key: "literature", label: "1시간 수업 (50분 진행)" }],
    },
  };

  // Minimum order is 10 sessions. Single trial sessions are arranged
  // manually via Kakao contact, not sold through this checkout. Keyed by
  // duration variant key (see SERVICES above), mirroring api/_prices.js.
  var PRICES = {
    conversation: {
      label: "회화 수업 · 1시간 수업 (50분 진행)",
      packages: {
        pack10: { label: "10회 패키지 (10% 할인)", amount: 405000 },
        pack20: { label: "20회 패키지 (15% 할인)", amount: 765000 },
        pack30: { label: "30회 패키지 (20% 할인)", amount: 1080000 },
      },
    },
    conversation_30min: {
      label: "회화 수업 · 30분 수업 (25분 진행)",
      packages: {
        pack10: { label: "10회 패키지 (10% 할인)", amount: 202500 },
        pack20: { label: "20회 패키지 (15% 할인)", amount: 382500 },
        pack30: { label: "30회 패키지 (20% 할인)", amount: 540000 },
      },
    },
    writing: {
      label: "작문 & 에세이 코칭 · 1시간 수업 (50분 진행)",
      packages: {
        pack10: { label: "10회 패키지 (10% 할인)", amount: 630000 },
        pack20: { label: "20회 패키지 (15% 할인)", amount: 1190000 },
        pack30: { label: "30회 패키지 (20% 할인)", amount: 1680000 },
      },
    },
    literature: {
      label: "문학 & 정독 세미나 · 1시간 수업 (50분 진행)",
      packages: {
        pack10: { label: "10회 패키지 (10% 할인)", amount: 540000 },
        pack20: { label: "20회 패키지 (15% 할인)", amount: 1020000 },
        pack30: { label: "30회 패키지 (20% 할인)", amount: 1440000 },
      },
    },
  };

  function formatWon(amount) {
    return amount.toLocaleString("ko-KR") + "원";
  }

  function randomKey() {
    if (window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
    return "key_" + Math.random().toString(36).slice(2) + Date.now();
  }

  var serviceSelect = document.getElementById("service-select");
  var durationSelect = document.getElementById("duration-select");
  var packageSelect = document.getElementById("package-select");
  var summaryLabel = document.getElementById("summary-label");
  var summaryAmount = document.getElementById("summary-amount");
  var form = document.getElementById("checkout-form");
  var payButton = document.getElementById("pay-button");
  var errorBox = document.getElementById("checkout-error");

  var params = new URLSearchParams(window.location.search);
  var preselect = params.get("service");
  if (preselect && SERVICES[preselect]) {
    serviceSelect.value = preselect;
  }

  function currentPackage() {
    return PRICES[durationSelect.value].packages[packageSelect.value];
  }

  function renderDurationOptions() {
    var durations = SERVICES[serviceSelect.value].durations;
    durationSelect.innerHTML = "";
    durations.forEach(function (d) {
      var opt = document.createElement("option");
      opt.value = d.key;
      opt.textContent = d.label;
      durationSelect.appendChild(opt);
    });
  }

  function renderPackageOptions() {
    var priceEntry = PRICES[durationSelect.value];
    packageSelect.innerHTML = "";
    Object.keys(priceEntry.packages).forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = priceEntry.packages[key].label + " - " + formatWon(priceEntry.packages[key].amount);
      packageSelect.appendChild(opt);
    });
  }

  function renderSummaryText() {
    var priceEntry = PRICES[durationSelect.value];
    var pkg = currentPackage();
    summaryLabel.textContent = priceEntry.label + " · " + pkg.label;
    summaryAmount.textContent = formatWon(pkg.amount);
  }

  renderDurationOptions();
  renderPackageOptions();
  renderSummaryText();

  var customerKey = sessionStorage.getItem("tossCustomerKey");
  if (!customerKey) {
    customerKey = randomKey();
    sessionStorage.setItem("tossCustomerKey", customerKey);
  }

  var widgets;
  var paymentWidgetReady = false;

  function showPaymentUnavailable() {
    document.getElementById("payment-method").innerHTML = "";
    document.getElementById("agreement").innerHTML = "";

    var notice = document.createElement("p");
    notice.style.color = "var(--color-text-muted)";
    notice.style.fontSize = "0.9rem";
    notice.style.marginTop = "18px";
    notice.textContent = "온라인 결제 시스템을 준비 중입니다. 아래 버튼으로 문의해 주시면 예약을 도와드리겠습니다.";

    var kakaoLink = document.createElement("a");
    kakaoLink.href = "reservation.html";
    kakaoLink.className = "btn btn-kakao";
    kakaoLink.style.width = "100%";
    kakaoLink.style.marginTop = "12px";
    kakaoLink.textContent = "카카오톡으로 문의하기";

    payButton.style.display = "none";
    payButton.parentNode.insertBefore(notice, payButton);
    payButton.parentNode.insertBefore(kakaoLink, payButton);
  }

  try {
    var tossPayments = TossPayments(TOSS_CLIENT_KEY);
    widgets = tossPayments.widgets({ customerKey: customerKey });
    await widgets.setAmount({ currency: "KRW", value: currentPackage().amount });
    await Promise.all([
      widgets.renderPaymentMethods({ selector: "#payment-method", variantKey: "DEFAULT" }),
      widgets.renderAgreement({ selector: "#agreement", variantKey: "AGREEMENT" }),
    ]);
    paymentWidgetReady = true;
  } catch (err) {
    console.error("Toss payment widget failed to initialize:", err);
    showPaymentUnavailable();
  }

  async function handleSelectionChange() {
    renderSummaryText();
    if (!paymentWidgetReady) return;
    try {
      await widgets.setAmount({ currency: "KRW", value: currentPackage().amount });
    } catch (err) {
      console.error("Failed to update widget amount:", err);
    }
  }

  serviceSelect.addEventListener("change", function () {
    renderDurationOptions();
    renderPackageOptions();
    handleSelectionChange();
  });
  durationSelect.addEventListener("change", function () {
    renderPackageOptions();
    handleSelectionChange();
  });
  packageSelect.addEventListener("change", handleSelectionChange);

  payButton.addEventListener("click", async function () {
    errorBox.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    payButton.disabled = true;
    payButton.textContent = "처리 중...";

    var customerName = document.getElementById("customer-name").value.trim();
    var phone = document.getElementById("customer-phone").value.trim();
    var email = document.getElementById("customer-email").value.trim();
    var preferredDate = document.getElementById("preferred-date").value;
    var preferredTime = document.getElementById("preferred-time").value;

    try {
      var orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: durationSelect.value,
          packageKey: packageSelect.value,
          customerName: customerName,
          phone: phone,
          email: email,
          preferredDate: preferredDate,
          preferredTime: preferredTime,
        }),
      });

      var orderData;
      try {
        orderData = await orderRes.json();
      } catch (parseErr) {
        throw new Error("서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.");
      }
      if (!orderRes.ok) {
        throw new Error(orderData.error || "주문 생성에 실패했습니다.");
      }

      await widgets.requestPayment({
        orderId: orderData.orderId,
        orderName: orderData.orderName,
        successUrl: window.location.origin + "/success.html",
        failUrl: window.location.origin + "/fail.html",
        customerEmail: email,
        customerName: customerName,
        customerMobilePhone: phone.replace(/[^0-9]/g, ""),
      });
    } catch (err) {
      errorBox.textContent = (err && err.message) || "결제 요청 중 오류가 발생했습니다.";
      payButton.disabled = false;
      payButton.textContent = "결제하기";
    }
  });
});
