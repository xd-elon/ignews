import styles from './styles.module.scss';

interface SubscriptionButtonProps {
    priceId: string;
}

export function SubscribeButton({ priceId }: SubscriptionButtonProps) {
    return (
        <button
            type="button"
            className={styles.subscribeButton}
        >
            Subscribe now
        </button>
    )
}