import api from './index';

export interface PaymentMilestone {
    id: number;
    transactionId: string;
    title: string;
    amount: number;
    percentage: number;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    dueDate: string;
    paidAt: string | null;
    paymentId: number | null;
    escrowTransactionId: number | null;
}

export const paymentMilestoneApi = {
    getMilestonesByTransaction: (transactionId: string) => {
        return api.get<PaymentMilestone[]>(`/payment-milestones/transaction/${transactionId}`);
    },
    getMilestone: (id: number) => {
        return api.get<PaymentMilestone>(`/payment-milestones/${id}`);
    },
    createMilestone: (data: Partial<PaymentMilestone>) => {
        return api.post<PaymentMilestone>('/payment-milestones', data);
    },
    updateMilestone: (id: number, data: Partial<PaymentMilestone>) => {
        return api.put<PaymentMilestone>(`/payment-milestones/${id}`, data);
    },
    deleteMilestone: (id: number) => {
        return api.delete(`/payment-milestones/${id}`);
    },
    markAsPaid: (id: number, paymentId: number) => {
        return api.patch<PaymentMilestone>(`/payment-milestones/${id}/pay?paymentId=${paymentId}`);
    }
};
