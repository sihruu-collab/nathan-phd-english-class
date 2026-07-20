document.addEventListener("DOMContentLoaded", async function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var paymentKey = params.get("paymentKey");
  var orderId = params.get("orderId");
  var amount = params.get("amount");

  var statusTitle = document.getElementById("status-title");
  var statusBody = document.getElementById("status-body");
  var detailBox = document.getElementById("order-details");

  if (!paymentKey || !orderId || !amount) {
    statusTitle.textContent = "결제 정보를 확인할 수 없습니다";
    statusBody.textContent = "필요한 결제 정보가 누락되었습니다. 다시 시도해 주세요.";
    return;
  }

  try {
    var res = await fetch("/api/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentKey: paymentKey, orderId: orderId, amount: Number(amount) }),
    });

    var data;
    try {
      data = await res.json();
    } catch (parseErr) {
      throw new Error("서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    }
    if (!res.ok) {
      throw new Error(data.error || "결제 확인에 실패했습니다.");
    }

    statusTitle.textContent = "결제가 완료되었습니다";
    statusBody.textContent = "예약이 접수되었습니다. 확인 후 입력하신 연락처로 정확한 수업 일정을 안내해 드립니다.";

    var order = data.order;
    if (order) {
      detailBox.innerHTML =
        '<div class="summary-row"><span>수업</span><strong>' + order.orderName + "</strong></div>" +
        '<div class="summary-row"><span>결제 금액</span><strong>' + Number(order.amount).toLocaleString("ko-KR") + "원</strong></div>" +
        '<div class="summary-row"><span>예약자</span><strong>' + order.customerName + "</strong></div>" +
        '<div class="summary-row"><span>희망 일정</span><strong>' + order.preferredDate + " · " + order.preferredTime + "</strong></div>";
    }
  } catch (err) {
    statusTitle.textContent = "결제 확인 중 오류가 발생했습니다";
    statusBody.textContent = (err && err.message) || "잠시 후 다시 시도해 주세요.";
  }
});
