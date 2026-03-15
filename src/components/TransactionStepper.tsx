import React from 'react';

interface Step {
  label: string;
  description?: string;
}

interface TransactionStepperProps {
  current: 1 | 2 | 3;
}

const steps: Step[] = [
  {
    label: 'Tổng quan giao dịch',
    description: 'Xem lại bất động sản và số tiền',
  },
  {
    label: 'Đọc & xác nhận hợp đồng',
    description: 'Kiểm tra điều khoản, trách nhiệm',
  },
  {
    label: 'Ký & thanh toán',
    description: 'VNPay hoặc ký trên Blockchain',
  },
];

export const TransactionStepper: React.FC<TransactionStepperProps> = ({ current }) => {
  return (
    <div className="mb-4">
      <ol className="flex flex-col md:flex-row md:items-stretch gap-2 md:gap-4">
        {steps.map((step, index) => {
          const stepNumber = (index + 1) as 1 | 2 | 3;
          const isActive = stepNumber === current;
          const isCompleted = stepNumber < current;

          return (
            <li
              key={step.label}
              className={`flex-1 rounded-lg border px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm transition-colors ${
                isActive
                  ? 'border-red-500 bg-red-50'
                  : isCompleted
                  ? 'border-emerald-500 bg-emerald-50/70'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {stepNumber}
                </div>
                <span
                  className={`font-medium ${
                    isActive
                      ? 'text-red-700'
                      : isCompleted
                      ? 'text-emerald-700'
                      : 'text-gray-700'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {step.description && (
                <p className="text-[11px] md:text-xs text-gray-500">{step.description}</p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

