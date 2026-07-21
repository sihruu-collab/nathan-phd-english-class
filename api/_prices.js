// Server-side source of truth for prices. The client (js/checkout.js) has its
// own copy for display purposes, but create-order.js always re-validates
// against this table so a customer can never submit an arbitrary amount.
//
// Minimum order is 10 sessions across all services. Single trial sessions are
// arranged manually (Kakao contact), not sold through checkout.
//
// Only 회화 수업 (conversation) has a duration choice - a 30-minute (25 min
// actual) option alongside the standard 1-hour (50 min actual) format, priced
// at exactly half. It's modeled as a separate top-level key
// ("conversation_30min") rather than a nested field so existing order rows
// and code that key off a flat `service` string keep working unchanged.
module.exports = {
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
