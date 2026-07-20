// Server-side source of truth for prices. The client (js/checkout.js) has its
// own copy for display purposes, but create-order.js always re-validates
// against this table so a customer can never submit an arbitrary amount.
//
// Minimum order is 10 sessions across all services. Single trial sessions are
// arranged manually (Kakao contact), not sold through checkout.
module.exports = {
  conversation: {
    label: "회화 수업",
    packages: {
      pack10: { label: "10회 패키지 (10% 할인)", amount: 405000 },
      pack20: { label: "20회 패키지 (15% 할인)", amount: 765000 },
      pack30: { label: "30회 패키지 (20% 할인)", amount: 1080000 },
    },
  },
  writing: {
    label: "작문 & 에세이 코칭",
    packages: {
      pack10: { label: "10회 패키지 (10% 할인)", amount: 630000 },
      pack20: { label: "20회 패키지 (15% 할인)", amount: 1190000 },
      pack30: { label: "30회 패키지 (20% 할인)", amount: 1680000 },
    },
  },
  literature: {
    label: "문학 & 정독 세미나",
    packages: {
      pack10: { label: "10회 패키지 (10% 할인)", amount: 540000 },
      pack20: { label: "20회 패키지 (15% 할인)", amount: 1020000 },
      pack30: { label: "30회 패키지 (20% 할인)", amount: 1440000 },
    },
  },
};
