// Server-side source of truth for prices. The client (js/checkout.js) has its
// own copy for display purposes, but create-order.js always re-validates
// against this table so a customer can never submit an arbitrary amount.
module.exports = {
  conversation: {
    label: "회화 수업",
    packages: {
      single: { label: "1회 (50분)", amount: 45000 },
      pack10: { label: "10회 패키지", amount: 405000 },
      pack20: { label: "20회 패키지", amount: 765000 },
    },
  },
  writing: {
    label: "작문 & 에세이 코칭",
    packages: {
      single: { label: "1회 (50분)", amount: 70000 },
      pack6: { label: "대입·유학 에세이 완성 패키지 (6회)", amount: 390000 },
      pack10: { label: "확장 패키지 (10회)", amount: 630000 },
    },
  },
  literature: {
    label: "문학 & 정독 세미나",
    packages: {
      single: { label: "1회 (50분)", amount: 60000 },
      pack10: { label: "10회 패키지", amount: 540000 },
    },
  },
};
