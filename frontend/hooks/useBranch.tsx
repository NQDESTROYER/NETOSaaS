import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const BranchContext = createContext<any>(null);

export const BranchProvider = ({ children }: { children: React.ReactNode }) => {
    const [branches, setBranches] = useState([]);
    const [activeBranch, setActiveBranch] = useState<string | null>(null);

    useEffect(() => {
        async function loadBranches() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase.from('branches').select('*').eq('profile_id', user.id);
            setBranches(data || []);
            if (data && data.length > 0) setActiveBranch(data[0].id);
        }
        loadBranches();
    }, []);

    return (
        <BranchContext.Provider value={{ branches, activeBranch, setActiveBranch }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => useContext(BranchContext);
