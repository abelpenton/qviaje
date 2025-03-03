import {useEffect, useState} from 'react'
import {toast} from 'sonner'
import {useSession} from 'next-auth/react'

export default function useAgency() {
    const [agency, setAgency] = useState(null);
    const [loading, setLoading] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        const fetchAgencyData = async () => {
            if (!session?.user?.id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/agencies/${session.user.id}`);

                if (!response.ok) {
                    toast.error('No se pudo cargar la información de la agencia');
                }

                const data = await response.json();
                setAgency(data);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los datos de la agencia');
            } finally {
                setLoading(false);
            }
        };

        fetchAgencyData();
    }, [session]);

    return {
        agency,
        loading
    }
}