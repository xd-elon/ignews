import { signIn, useSession } from 'next-auth/client';
import { api } from '../../services/api';
import styles from './styles.module.scss';

interface SubscriptionButtonProps {
    priceId: string;
}


export function SubscribeButton({ priceId }: SubscriptionButtonProps) {
    const [session] = useSession();

    function handleSubscribe() {
        if(!session) {
            signIn('github')
            return;
        }

        try {
            const response = await api.post('/subscribe')

            const { sessionId } = response.data;
        } catch {
            
        }
    }

    return (
        <button
            type="button"
            className={styles.subscribeButton}
        >
            Subscribe now
        </button>
    )
}