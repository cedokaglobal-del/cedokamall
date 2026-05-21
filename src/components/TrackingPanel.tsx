import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, ExternalLink, TrendingUp } from 'lucide-react';
import { getTrackingData } from '@/utils/tracking';

const TrackingPanel = () => {
  const [tab, setTab] = useState<'searches' | 'pages' | 'referrers'>('searches');
  const data = useMemo(() => getTrackingData(), []);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg">On-Site Analytics</h3>
      </div>

      <div className="flex gap-2 mb-4 border-b pb-2">
        <button onClick={() => setTab('searches')} className={`text-sm font-medium pb-1 px-2 ${tab === 'searches' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          <Search className="w-3.5 h-3.5 inline mr-1" />Searches ({data.searches.length})
        </button>
        <button onClick={() => setTab('pages')} className={`text-sm font-medium pb-1 px-2 ${tab === 'pages' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          <Eye className="w-3.5 h-3.5 inline mr-1" />Top Pages
        </button>
        <button onClick={() => setTab('referrers')} className={`text-sm font-medium pb-1 px-2 ${tab === 'referrers' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}>
          <ExternalLink className="w-3.5 h-3.5 inline mr-1" />Traffic Sources
        </button>
      </div>

      {tab === 'searches' && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {data.searches.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No searches recorded yet.</p>
          ) : (
            data.searches.slice(0, 20).map((s) => (
              <div key={s.term} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                <span className="text-sm truncate max-w-[200px]">{s.term}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{s.count}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'pages' && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {data.pageViews.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No page views recorded yet.</p>
          ) : (
            data.pageViews.slice(0, 20).map((p) => (
              <div key={p.path} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                <span className="text-sm truncate max-w-[200px]">{p.path || '/'}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{p.count}</Badge>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'referrers' && (
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {data.referrers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No referrer data yet.</p>
          ) : (
            data.referrers.map((r) => (
              <div key={r.source} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                <span className="text-sm truncate max-w-[200px]">{r.source}</span>
                <Badge variant="secondary" className="text-xs shrink-0">{r.count}</Badge>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default TrackingPanel;
