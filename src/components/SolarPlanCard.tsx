import { Zap, Clock, AlertTriangle } from 'lucide-react';
import type { SolarPlan } from '@/types/solarPlan';

interface SolarPlanCardProps {
  plan: SolarPlan;
  compact?: boolean;
}

const SolarPlanCard = ({ plan, compact = false }: SolarPlanCardProps) => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gold-antique/10 bg-white shadow-sm transition-shadow hover:shadow-md">
      {plan.image && (
        <img src={plan.image} alt={plan.name} className="h-48 w-full object-cover" />
      )}
      <div className="flex flex-1 flex-col p-6">
        <div>
          <h3 className="font-serif text-lg font-bold text-navy">{plan.name}</h3>
          {plan.capacity && (
            <p className="mt-1 text-xs font-bold uppercase tracking-wider text-gold">{plan.capacity}</p>
          )}
        </div>

        {plan.price > 0 && (
          <p className="mt-3 text-2xl font-bold text-navy">{'\u20A6'}{plan.price.toLocaleString()}</p>
        )}

        {plan.description && (
          <p className="mt-3 text-sm leading-6 text-navy/60">{plan.description}</p>
        )}

        {plan.bestFor && (
          <div className="mt-4 rounded-xl bg-gold/5 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-navy/45">Best For</p>
            <p className="mt-1 text-sm font-semibold text-navy">{plan.bestFor}</p>
          </div>
        )}

        {plan.canPower.length > 0 && (
          <div className="mt-4">
            <div className="mb-2.5 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-gold" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-navy/45">Can Power</p>
            </div>
            <ul className="space-y-1.5">
              {plan.canPower.map((item) => (
                <li key={item} className="flex items-center gap-2 text-[13px] text-navy/70">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {plan.backupTime && (
          <div className="mt-4 flex items-center gap-3 rounded-xl bg-navy/5 px-4 py-3">
            <Clock className="h-4 w-4 shrink-0 text-navy/40" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Backup Time</p>
              <p className="mt-0.5 text-sm font-semibold text-navy">{plan.backupTime}</p>
            </div>
          </div>
        )}

        {!compact && plan.items.length > 0 && (
          <div className="mt-4 border-t border-gold-antique/10 pt-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-navy/40">Includes</p>
            <ul className="mt-2 space-y-1">
              {plan.items.map((item) => (
                <li key={item.id} className="text-xs text-navy/55">
                  {item.quantity}{'\u00D7'} {item.name} ({item.watts}W / {item.volts}V)
                </li>
              ))}
            </ul>
          </div>
        )}

        {!compact && plan.notes && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-amber-50 px-4 py-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
            <p className="text-xs leading-5 text-amber-800">{plan.notes}</p>
          </div>
        )}

        <div className="mt-auto pt-5">
          <a
            href={`https://wa.me/2349128817136?text=${encodeURIComponent(
              `Hi Cedokamall, I'm interested in the ${plan.name} solar plan. Please share availability and a quote.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-navy transition-all hover:bg-gold-antique hover:text-white"
          >
            Get a quote
          </a>
        </div>
      </div>
    </div>
  );
};

export default SolarPlanCard;
