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

export const EventRow: React.FC<Props> = ({ item }) => {
  const date = item.nextSessionStartsAt
    ? new Date(item.nextSessionStartsAt)
    : null;
  return (
    <Link to={`/events/${item.slug}`} className={Styles.row}>
      <div className={Styles.rowDate}>
        {date ? (
          <>
            <div className={Styles.rowDow}>
              {date.toLocaleDateString(undefined, { weekday: 'short' })}
            </div>
            <div className={Styles.rowDay}>
              {date.toLocaleDateString(undefined, { day: '2-digit' })}
            </div>
            <div className={Styles.rowMonth}>
              {date.toLocaleDateString(undefined, { month: 'short' })}
            </div>
          </>
        ) : (
          <div className={Styles.rowDay}>—</div>
        )}
      </div>
      <div>
        {item.category && (
          <div className={Styles.rowCategory}>
            {item.category.name.toUpperCase()}
          </div>
        )}
        <div className={Styles.rowTitle}>{item.title}</div>
        <div className={Styles.rowMeta}>
          {item.venue ? `${item.venue.name} · ${item.venue.city}` : ''}
        </div>
      </div>
      <div className={Styles.rowPrice}>
        {item.fromPrice !== null ? (
          <span className="display">
            {formatMoney(item.fromPrice, item.currency)}
          </span>
        ) : (
          <span className="mono" style={{ color: '#6b6760' }}>
            —
          </span>
        )}
      </div>
    </Link>
  );
};

export default EventRow;
