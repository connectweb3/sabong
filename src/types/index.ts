export type UserRole = 'admin' | 'master_agent' | 'agent' | 'loader' | 'user';

export interface Profile {
    id: string;
    username: string;
    role: UserRole;
    credits: number;
    created_by: string | null;
    referral_code: string | null;
    phone_number: string | null;
    facebook_url: string | null;
    status: 'pending' | 'active' | 'banned';
    created_at: string;
}

export interface Transaction {
    id: string;
    sender_id: string | null;
    receiver_id: string | null;
    amount: number;
    type: 'load' | 'withdraw' | 'bet' | 'win' | 'commission' | 'transfer';
    created_at: string;
}

export interface Bet {
    id: string;
    user_id: string;
    match_id: string;
    amount: number;
    selection: 'meron' | 'wala' | 'draw';
    status: 'pending' | 'won' | 'lost' | 'cancelled';
    payout: number;
    created_at: string;
}

export type MatchStatus = 'open' | 'closed' | 'ongoing' | 'finished' | 'cancelled';
export type MatchWinner = 'meron' | 'wala' | 'draw' | null;

export interface Match {
    id: string;
    meron_name: string;
    wala_name: string;
    status: MatchStatus;
    winner: MatchWinner;
    created_at: string;
}
