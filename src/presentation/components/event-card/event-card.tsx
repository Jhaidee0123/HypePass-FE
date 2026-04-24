import React from 'react';
import { Link } from 'react-router-dom';
import { PublicEventListItem } from '@/domain/models';
import Styles from './event-card-styles.scss';

type Props = {
  item: PublicEventListItem;
};

const formatMoney = (minorUnits: number, currency: string) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(minorUnits / 100);

export const EventCard: React.FC<Props> = ({ item }) => {
  const date = item.nextSessionStartsAt
    ? new Date(item.nextSessionStartsAt)
    : null;
  return (
    <Link to={`/events/${item.slug}`} className={Styles.card}>
      <div className={Styles.cardCoverWrap}>
        {item.coverImageUrl ? (
          <img
            src={item.coverImageUrl}
            alt={item.title}
            className={Styles.cardCover}
          />
        ) : (
          <div className={Styles.cardCoverEmpty}>NO COVER</div>
        )}
        <div className={Styles.cardBadges}>
          {date && (
            <span className={Styles.cardDate}>
              {date.toLocaleString(undefined, {
                weekday: 'short',
                month: 'short',
                day: '2-digit',
              })}
            </span>
          )}
        </div>
        {item.fromPrice !== null && (
          <div className={Styles.cardPrice}>
            FROM {formatMoney(item.fromPrice, item.currency)}
          </div>
        )}
      </div>
      <div>
        {item.category && (
          <div className={Styles.cardCategory}>
            {item.category.name.toUpperCase()}
          </div>
        )}
        <div className={Styles.cardTitle}>{item.title}</div>
        <div className={Styles.cardMeta}>
          {item.venue ? `${item.venue.name} · ${item.venue.city}` : ''}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
