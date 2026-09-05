import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink
} from 'lucide-react';
import { convexClient as supabaseClient } from '../services/convex';
import { Button } from '../components';
import { getDealStageColor } from '../utils/deal';
import toast from 'react-hot-toast';

interface CalendarEvent {
  id: string;
  dealId: string;
  dealTitle: string;
  brandName: string;
  brandLogo: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'script' | 'draft' | 'live' | 'payment' | 'custom';
  status: string;
  stage: string;
}

export const Calendar: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Load calendar events
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const deals = await supabaseClient.deals.list();
        const invoices = await supabaseClient.invoices.list();
        
        let allEvents: CalendarEvent[] = [];

        // 1. Deliverables events
        for (const deal of deals) {
          const deliverables = await supabaseClient.deliverables.list(deal.id);
          // Standard brand metadata
          let bName = 'Brand partner';
          let bLogo = 'https://logo.clearbit.com/samsung.com';
          if (deal.brand_id.includes('samsung')) {
            bName = 'Samsung';
            bLogo = 'https://logo.clearbit.com/samsung.com';
          } else if (deal.brand_id.includes('nordvpn')) {
            bName = 'NordVPN';
            bLogo = 'https://logo.clearbit.com/nordvpn.com';
          } else if (deal.brand_id.includes('lumen')) {
            bName = 'Lumen Health';
            bLogo = 'https://logo.clearbit.com/lumen.me';
          } else if (deal.brand_id.includes('adobe')) {
            bName = 'Adobe';
            bLogo = 'https://logo.clearbit.com/adobe.com';
          }

          deliverables.forEach(d => {
            if (!d.due_date) return;
            // Classify deliverables: "script", "draft", "live"
            const nameLower = d.name.toLowerCase();
            let type: 'script' | 'draft' | 'live' = 'draft';
            if (nameLower.includes('script')) {
              type = 'script';
            } else if (nameLower.includes('live') || nameLower.includes('publish') || nameLower.includes('post')) {
              type = 'live';
            }

            allEvents.push({
              id: d.id,
              dealId: deal.id,
              dealTitle: deal.title,
              brandName: bName,
              brandLogo: bLogo,
              title: d.name,
              date: d.due_date,
              type,
              status: d.status,
              stage: deal.stage
            });
          });

          // Also generate a mock "Post Live" date and "Script due" if they don't have deliverables for demo
          if (deliverables.length === 0) {
            const dateStr = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            allEvents.push({
              id: 'del_mock_' + deal.id,
              dealId: deal.id,
              dealTitle: deal.title,
              brandName: bName,
              brandLogo: bLogo,
              title: 'Draft Submission Deadline',
              date: dateStr,
              type: 'draft',
              status: 'pending',
              stage: deal.stage
            });
          }
        }

        // 2. Invoices payment due dates
        invoices.forEach(inv => {
          if (!inv.due_date) return;
          const deal = deals.find(d => d.id === inv.deal_id);
          const dealTitle = deal ? deal.title : 'Deal Sponsorship';
          let bName = 'Brand partner';
          let bLogo = 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80';
          if (deal) {
            if (deal.brand_id.includes('samsung')) {
              bName = 'Samsung';
              bLogo = 'https://logo.clearbit.com/samsung.com';
            } else if (deal.brand_id.includes('nordvpn')) {
              bName = 'NordVPN';
              bLogo = 'https://logo.clearbit.com/nordvpn.com';
            } else if (deal.brand_id.includes('lumen')) {
              bName = 'Lumen Health';
              bLogo = 'https://logo.clearbit.com/lumen.me';
            } else if (deal.brand_id.includes('adobe')) {
              bName = 'Adobe';
              bLogo = 'https://logo.clearbit.com/adobe.com';
            }
          }

          allEvents.push({
            id: inv.id,
            dealId: inv.deal_id,
            dealTitle,
            brandName: bName,
            brandLogo: bLogo,
            title: `Payment Release â€” $${inv.amount.toLocaleString()}`,
            date: inv.due_date,
            type: 'payment',
            status: inv.status,
            stage: deal ? deal.stage : 'completed'
          });
        });

        // 3. Today's Schedule Alignment Call mock
        const todayStr = new Date().toISOString().split('T')[0];
        allEvents.push({
          id: 'evt_call_samsung',
          dealId: 'deal_samsung_galaxy',
          dealTitle: 'Galaxy S26 Ultra Launch Integration',
          brandName: 'Samsung',
          brandLogo: 'https://logo.clearbit.com/samsung.com',
          title: 'S26 Brief Alignment Meeting',
          date: todayStr,
          time: '10:00 AM',
          type: 'custom',
          status: 'scheduled',
          stage: 'negotiating'
        });

        setEvents(allEvents);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load calendar milestones.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Helper date generators
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getWeekDays = (date: Date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day; // adjust when day is sunday
    startOfWeek.setDate(diff);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (view === 'month') {
      nextDate.setMonth(currentDate.getMonth() - 1);
    } else if (view === 'week') {
      nextDate.setDate(currentDate.getDate() - 7);
    } else {
      nextDate.setDate(currentDate.getDate() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (view === 'month') {
      nextDate.setMonth(currentDate.getMonth() + 1);
    } else if (view === 'week') {
      nextDate.setDate(currentDate.getDate() + 7);
    } else {
      nextDate.setDate(currentDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getEventColors = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'script':
        return { bg: 'bg-warning-bg text-warning border-l-[3px] border-warning', pillBg: 'bg-warning', text: 'text-warning' };
      case 'draft':
        return { bg: 'bg-brand-light text-brand border-l-[3px] border-brand', pillBg: 'bg-brand', text: 'text-brand' };
      case 'live':
        return { bg: 'bg-success-bg text-success border-l-[3px] border-success', pillBg: 'bg-success', text: 'text-success' };
      case 'payment':
        return { bg: 'bg-info-bg text-info border-l-[3px] border-info', pillBg: 'bg-info', text: 'text-info' };
      default:
        return { bg: 'bg-surface-2 text-text-secondary border-l-[3px] border-border-strong', pillBg: 'bg-border-strong', text: 'text-text-secondary' };
    }
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setSelectedEvent(event);
    // Position popover beautifully relative to clicked element
    setPopoverPosition({
      x: Math.min(window.innerWidth - 340, rect.left),
      y: Math.min(window.innerHeight - 300, rect.bottom + window.scrollY + 8)
    });
  };

  const getFormattedHeaderDate = () => {
    if (view === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (view === 'week') {
      const days = getWeekDays(currentDate);
      return `${days[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} â€“ ${days[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  // Close popover when clicking anywhere else
  useEffect(() => {
    const handleOutsideClick = () => {
      setSelectedEvent(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 select-none animate-stagger-item">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border pb-4 select-none">
        <div className="flex flex-col leading-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-tight flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-brand" />
            <span>Campaign Deadlines Calendar</span>
          </h2>
          <p className="text-xs text-text-muted mt-1.5 leading-none">
            Keep track of integration scripts, draft submissions, live dates, and expected payment releases.
          </p>
        </div>

        {/* View segmented control */}
        <div className="flex bg-surface-2 border border-border p-0.5 rounded-lg text-xs font-bold leading-none mt-4 md:mt-0">
          {(['month', 'week', 'day'] as const).map(v => (
            <button
              key={v}
              onClick={() => { setView(v); setSelectedEvent(null); }}
              className={`px-3 py-1.5 rounded-md transition-spring hover:-translate-y-0.5 active:scale-95 uppercase tracking-wider text-[10px] ${
                view === v 
                  ? 'bg-surface text-brand shadow-sm font-extrabold' 
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation and Today controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrev}
            className="p-2 border border-border hover:bg-surface-2 rounded-lg text-text-secondary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-text-primary sora-heading min-w-[180px] text-center">
            {getFormattedHeaderDate()}
          </span>
          <button 
            onClick={handleNext}
            className="p-2 border border-border hover:bg-surface-2 rounded-lg text-text-secondary transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <Button variant="secondary" className="text-xs font-bold" onClick={handleToday}>
          Today
        </Button>
      </div>

      {/* Calendar Grid rendering */}
      {loading ? (
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 bg-surface-2 animate-pulse rounded" />
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-28 bg-surface-2 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-2xl shadow-sm overflow-hidden select-none">
          
          {/* MONTH VIEW */}
          {view === 'month' && (
            <div>
              {/* Day names */}
              <div className="grid grid-cols-7 border-b border-border text-center bg-surface-2/20 py-2.5 text-[9.5px] font-bold text-text-muted uppercase tracking-wider">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-border border-t border-border -mt-[1px]">
                {getDaysInMonth(currentDate).map((day, idx) => {
                  if (day === null) {
                    return <div key={`empty-${idx}`} className="h-32 bg-surface-2/10" />;
                  }

                  const dateStr = formatDateString(day);
                  const dayEvents = events.filter(e => e.date === dateStr);
                  const isToday = formatDateString(new Date()) === dateStr;
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth();

                  // Congestion handling: limit to 2 events + count of remainder
                  const displayEvents = dayEvents.slice(0, 2);
                  const remainingCount = dayEvents.length - 2;

                  return (
                    <div 
                      key={dateStr} 
                      className={`h-32 p-2 flex flex-col justify-between hover:bg-surface-2/5 transition-colors group relative ${
                        !isCurrentMonth ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span 
                          data-type="number" 
                          className={`font-mono text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                            isToday 
                              ? 'bg-brand text-white' 
                              : 'text-text-secondary group-hover:text-text-primary'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        
                        {dayEvents.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand md:hidden" />
                        )}
                      </div>

                      {/* Events wrapper stack */}
                      <div className="flex-1 mt-2 space-y-1 overflow-y-auto no-scrollbar max-h-[70px]">
                        {displayEvents.map(evt => {
                          const cl = getEventColors(evt.type);
                          return (
                            <div
                              key={evt.id}
                              onClick={(e) => handleEventClick(evt, e)}
                              className={`text-[9.5px] font-bold p-1 rounded border border-transparent hover:border-black/5 flex items-center space-x-1 cursor-pointer truncate max-w-full shadow-sm leading-tight transition-all duration-100 ${cl.bg}`}
                              title={evt.title}
                            >
                              <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cl.pillBg}`} />
                              <span className="truncate">{evt.brandName}: {evt.title}</span>
                            </div>
                          );
                        })}

                        {remainingCount > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentDate(day);
                              setView('day');
                            }}
                            className="w-full text-left text-[9px] font-bold text-brand hover:underline px-1 py-0.5 leading-none"
                          >
                            + {remainingCount} more
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WEEK VIEW */}
          {view === 'week' && (
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-border bg-surface-2/20 py-2.5 text-center">
                {getWeekDays(currentDate).map((day) => {
                  const dateStr = formatDateString(day);
                  const isToday = formatDateString(new Date()) === dateStr;
                  return (
                    <div key={dateStr} className="flex flex-col items-center">
                      <span className="text-[9.5px] font-bold text-text-muted uppercase tracking-wider">
                        {day.toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span 
                        data-type="number" 
                        className={`font-mono text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center mt-1 ${
                          isToday ? 'bg-brand text-white' : 'text-text-primary'
                        }`}
                      >
                        {day.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Day columns */}
              <div className="grid grid-cols-7 divide-x divide-border min-h-[400px]">
                {getWeekDays(currentDate).map((day) => {
                  const dateStr = formatDateString(day);
                  const dayEvents = events.filter(e => e.date === dateStr);

                  return (
                    <div key={dateStr} className="p-2 space-y-2 hover:bg-surface-2/5 transition-colors">
                      {dayEvents.map(evt => {
                        const cl = getEventColors(evt.type);
                        return (
                          <div
                            key={evt.id}
                            onClick={(e) => handleEventClick(evt, e)}
                            className={`p-2 rounded-xl flex flex-col space-y-1.5 cursor-pointer shadow-sm border border-border/40 hover:scale-[1.02] transition-transform ${cl.bg}`}
                          >
                            <span className="text-[8px] font-extrabold uppercase tracking-wider opacity-60">
                              {evt.type}
                            </span>
                            <span className="text-[10px] font-bold leading-tight">{evt.title}</span>
                            <span className="text-[9px] opacity-75">{evt.brandName}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DAY VIEW */}
          {view === 'day' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-border pb-3 mb-4">
                <span data-type="number" className="font-mono text-2xl font-bold text-brand">
                  {currentDate.getDate()}
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-sm font-bold text-text-primary sora-heading">
                    {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                  <span className="text-[10px] text-text-muted mt-1">
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {(() => {
                  const dayEvents = events.filter(e => e.date === formatDateString(currentDate));
                  return dayEvents.length > 0 ? (
                    dayEvents.map(evt => {
                      const cl = getEventColors(evt.type);
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => handleEventClick(evt, e)}
                          className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer border border-border/40 shadow-sm hover:scale-[1.01] transition-transform ${cl.bg}`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cl.pillBg}`} />
                            <div className="flex flex-col leading-tight">
                              <span className="text-xs font-extrabold uppercase tracking-wider opacity-65">{evt.type}</span>
                              <span className="text-sm font-bold text-text-primary mt-1">{evt.title}</span>
                              <span className="text-[11px] text-text-secondary mt-0.5">Sponsor: {evt.brandName}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 text-xs font-semibold">
                            {evt.time && (
                              <span data-type="number" className="font-mono text-text-secondary">{evt.time}</span>
                            )}
                            <span className="px-2 py-0.5 rounded border bg-surface border-border text-[9px] uppercase font-bold text-text-muted">
                              {evt.status}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-16 text-text-muted text-xs flex flex-col items-center space-y-3">
                      <CalendarIcon className="w-8 h-8 text-text-faint" />
                      <span>No deliverables, payments or sponsor meetings due today.</span>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Popover overlay for details */}
      {selectedEvent && popoverPosition && (
        <div 
          onClick={(e) => e.stopPropagation()} // stop click bubbling to window click listener
          style={{ top: popoverPosition.y, left: popoverPosition.x }}
          className="absolute w-80 bg-surface border border-border rounded-xl shadow-xl z-50 p-4 select-none animate-stagger-item text-xs space-y-4"
        >
          {/* Header */}
          <div className="flex items-start space-x-3 border-b border-border pb-3">
            <img 
              src={selectedEvent.brandLogo} 
              alt={selectedEvent.brandName} 
              className="w-9 h-9 rounded-lg object-cover border border-border flex-shrink-0" 
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand">
                {selectedEvent.type} Milestone
              </span>
              <span className="text-xs font-bold text-text-primary mt-1 truncate max-w-[200px]" title={selectedEvent.title}>
                {selectedEvent.title}
              </span>
              <span className="text-[10px] text-text-muted mt-0.5 font-medium truncate max-w-[200px]" title={selectedEvent.dealTitle}>
                {selectedEvent.dealTitle}
              </span>
            </div>
          </div>

          {/* Details body */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-text-muted font-medium">Due Date:</span>
              <span data-type="number" className="font-mono font-bold text-text-primary">
                {selectedEvent.time ? `${selectedEvent.date} @ ${selectedEvent.time}` : selectedEvent.date}
              </span>
            </div>

            <div className="flex justify-between items-center text-[10px]">
              <span className="text-text-muted font-medium">Stage Status:</span>
              <span className="px-2 py-0.5 rounded-sm text-[9px] uppercase font-bold border" 
                    style={{ 
                      borderColor: getDealStageColor(selectedEvent.stage as any) + '30',
                      color: getDealStageColor(selectedEvent.stage as any),
                      backgroundColor: getDealStageColor(selectedEvent.stage as any) + '08'
                    }}>
                {selectedEvent.stage.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => navigate(`/deals/${selectedEvent.dealId}`)}
            className="w-full h-8 bg-brand hover:bg-brand-dark text-white rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
          >
            <span>Open Deal Room</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
};
export default Calendar;

