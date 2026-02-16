import { ScrollArea } from "@/components/ui/scroll-area";
import { Transaction } from "@/lib/types";
import { History, TrendingUp, TrendingDown, Coins, ArrowUpCircle, ArrowDownCircle, ChevronRight } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

type TransactionHistoryProps = {
  transactions: Transaction[];
};

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const totalCredits = transactions
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + tx.amount, 0);
    
  const totalDebits = transactions
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    // CSV Headers
    const headers = ["Date", "Time", "Description", "Type", "Amount", "Category"];
    
    // CSV Rows
    const rows = transactions.map(tx => {
      const dateObj = tx.timestamp.toDate();
      const date = dateObj.toLocaleDateString();
      const time = dateObj.toLocaleTimeString();
      return [
        date,
        time,
        `"${tx.description.replace(/"/g, '""')}"`, // Escape quotes
        tx.type.toUpperCase(),
        tx.amount,
        tx.category || "N/A"
      ];
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `StudiFy_Transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="group relative h-full flex flex-col overflow-hidden rounded-[3rem] p-[1px] transition-all duration-700 hover:scale-[1.01] bg-gradient-to-br from-accent/30 via-accent/10 to-transparent shadow-2xl">
      {/* Premium Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative h-full bg-card/60 backdrop-blur-3xl rounded-[2.9rem] p-6 md:p-8 flex flex-col gap-6 border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-accent/10 rounded-[1rem] border border-accent/20 shadow-xl ring-1 ring-accent/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <History className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-1">Financial Flow</p>
              <h3 className="text-2xl font-black uppercase tracking-tight text-foreground">Activity <span className="text-accent">Log</span></h3>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 py-1.5 px-4 rounded-full bg-accent/10 border border-accent/20 shadow-lg ring-1 ring-accent/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-accent">Live Stream</span>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Credits', val: totalCredits, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            { label: 'Debits', val: totalDebits, icon: TrendingDown, color: 'text-rose-400', bg: 'bg-rose-500/10' },
            { label: 'Net Yield', val: totalCredits - totalDebits, icon: Coins, color: 'text-primary', bg: 'bg-primary/10' }
          ].map((stat, i) => (
            <div key={i} className={`p-3 rounded-[1rem] bg-white/5 border border-white/10 flex flex-col items-center justify-center gap-1.5 group/stat hover:bg-white/10 transition-all duration-500`}>
              <stat.icon className={`h-3.5 w-3.5 ${stat.color} mb-0.5`} />
              <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className={`text-xs font-black tracking-tight ${stat.color}`}>
                {stat.val > 0 ? '+' : ''}{stat.val.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        
        <div className="flex-1 min-h-0 -mx-4">
          <ScrollArea className="h-full px-4">
            <div className="space-y-4 pb-4">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="group/item relative overflow-hidden rounded-[1.5rem] border border-white/5 bg-white/5 p-5 transition-all duration-500 hover:bg-white/10 hover:border-white/10 shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-[1rem] transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-3 ${
                        tx.type === 'credit' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                      }`}>
                        {tx.type === 'credit' ? (
                          <ArrowUpCircle className="h-5 w-5" />
                        ) : (
                          <ArrowDownCircle className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-[0.1em] text-foreground/90 truncate transition-colors leading-tight">
                          {tx.description}
                        </p>
                        <p className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                          <History className="h-2.5 w-2.5" />
                          {formatDistanceToNow(tx.timestamp.toDate(), { addSuffix: true })}
                        </p>
                      </div>
                      <div className={`text-lg font-black tracking-tighter shrink-0 ml-2 ${
                        tx.type === 'credit' 
                          ? 'text-emerald-400' 
                          : 'text-rose-400'
                      }`}>
                        {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-[2.5rem] bg-white/5 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/10">
                    <Coins className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                  <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">No activity detected</p>
                  <p className="text-xs text-muted-foreground/20 mt-2 font-medium">Initiate transactions to populate history</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-accent/40" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground/40">{transactions.length} ARCHIVED ENTRIES</span>
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="group/dl flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-accent hover:text-accent/80 transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Export Analytics <ChevronRight className="h-3 w-3 transition-transform duration-500 group-hover/dl:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Background blobs */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
      <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
    </div>
  );
}
