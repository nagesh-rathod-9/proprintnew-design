import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageSquareQuote,
  Search,
  Filter,
  Phone,
  Mail,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronDown,
  Trash2,
  Eye,
  Plus,
  ArrowUpRight,
  Send,
  MessageSquare,
  Building2,
  Printer,
  FileText,
  AlertCircle,
  X,
  ExternalLink,
  ShoppingCart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { QuoteRequest } from '../../types';
import { openDirectWhatsApp } from '../../utils/whatsapp';

export const AdminQuotesPage: React.FC = () => {
  const { quotes, updateQuoteStatus, deleteQuote, addQuote, showToast } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<QuoteRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Manual Add Quote Form State
  const [newClientName, setNewClientName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newService, setNewService] = useState('Commercial Printing');
  const [newQuantity, setNewQuantity] = useState('500');
  const [newPaperGsm, setNewPaperGsm] = useState('350 GSM');
  const [newFinish, setNewFinish] = useState('Matte Lamination');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState('New');

  // Status mapping
  const STATUS_MAP: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
    'New': { label: 'New Inquiry', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-500' },
    'In Review': { label: 'In Review', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200', dot: 'bg-amber-500' },
    'Contacted': { label: 'Contacted', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
    'Quoted': { label: 'Quoted / Rate Sent', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
    'Completed': { label: 'Order Placed / Converted', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    'Cancelled': { label: 'Closed / Rejected', bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-300', dot: 'bg-slate-400' }
  };

  const ALL_STATUSES = ['New', 'In Review', 'Contacted', 'Quoted', 'Completed', 'Cancelled'];

  const getStatusBadge = (rawStatus?: string) => {
    const s = rawStatus || 'New';
    return STATUS_MAP[s] || { label: s, bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', dot: 'bg-slate-400' };
  };

  // Metrics
  const totalCount = quotes.length;
  const newCount = quotes.filter(q => (q.status || 'New') === 'New').length;
  const inReviewCount = quotes.filter(q => q.status === 'In Review' || q.status === 'Contacted').length;
  const convertedCount = quotes.filter(q => q.status === 'Completed' || q.status === 'Quoted').length;

  // Filtered quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const name = (q.clientName || q.customerName || q.name || '').toLowerCase();
      const phone = (q.phone || q.customerPhone || '').toLowerCase();
      const email = (q.email || q.customerEmail || '').toLowerCase();
      const service = (q.serviceRequired || q.productCategory || q.category || '').toLowerCase();
      const desc = (q.projectDescription || q.specialInstructions || q.specifications || '').toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = !searchQuery || name.includes(query) || phone.includes(query) || email.includes(query) || service.includes(query) || desc.includes(query);

      const status = q.status || 'New';
      const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [quotes, searchQuery, statusFilter]);

  const handleOpenWhatsApp = (q: QuoteRequest) => {
    const name = q.clientName || q.customerName || q.name || 'Client';
    const service = q.serviceRequired || q.productCategory || q.category || 'Printing Service';
    const qty = q.estimatedQuantity || q.quantity || '500';
    const specs = q.projectDescription || q.specialInstructions || q.specifications || '';

    const msg = `Hello ${name}! 👋\n\nThis is Proprint Printing Press (Chhatrapati Sambhajinagar).\n` +
      `We received your inquiry for *${service}* (Quantity: *${qty} units*).\n` +
      (specs ? `Specifications noted: ${specs}\n\n` : '\n') +
      `We would love to share our factory-direct quote and turnaround schedule with you. Could you let us know when would be a convenient time to discuss?`;

    openDirectWhatsApp(msg);
  };

  const handleCreateManualQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newPhone) {
      showToast('Client name and phone number are required', 'error');
      return;
    }

    const createdQuote: QuoteRequest = {
      id: `quote-${Date.now()}`,
      clientName: newClientName,
      customerName: newClientName,
      name: newClientName,
      phone: newPhone,
      customerPhone: newPhone,
      email: newEmail,
      customerEmail: newEmail,
      companyName: newCompanyName,
      serviceRequired: newService,
      productCategory: newService,
      category: newService,
      estimatedQuantity: newQuantity,
      quantity: newQuantity,
      paperGsm: newPaperGsm,
      finish: newFinish,
      finishType: newFinish,
      projectDescription: newDescription,
      specialInstructions: newDescription,
      specifications: newDescription,
      status: newStatus,
      createdAt: new Date().toISOString()
    };

    addQuote(createdQuote);
    setIsAddModalOpen(false);
    showToast(`Quote request for ${newClientName} recorded successfully!`, 'success');

    // Reset Form
    setNewClientName('');
    setNewPhone('');
    setNewEmail('');
    setNewCompanyName('');
    setNewService('Commercial Printing');
    setNewQuantity('500');
    setNewPaperGsm('350 GSM');
    setNewFinish('Matte Lamination');
    setNewDescription('');
    setNewStatus('New');
  };

  const handleConvertToOrder = (q: QuoteRequest) => {
    const name = encodeURIComponent(q.clientName || q.customerName || q.name || '');
    const phone = encodeURIComponent(q.phone || q.customerPhone || '');
    const email = encodeURIComponent(q.email || q.customerEmail || '');
    navigate(`/admin/orders/new?name=${name}&phone=${phone}&email=${email}`);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* 1. Header Banner & Actions                                */}
      {/* ========================================================= */}
      <div className="bg-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#FF0038] bg-white px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FF0038]" />
              Wholesale & Custom Estimates Desk
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            Custom Quote Requests
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
            Real-time customer inquiries collected from web forms, WhatsApp, and walk-in telephone quotations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#FF0038] hover:bg-rose-600 active:scale-95 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log In-Person / Phone Quote</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. Key Metrics Bar                                        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Inquiries</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalCount}</div>
          <div className="text-[11px] text-slate-500 font-medium">All logged requests</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-100 shadow-2xs space-y-1.5 bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between text-rose-500 text-xs font-bold uppercase tracking-wider">
            <span>Action Required</span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-[#FF0038]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#FF0038]">{newCount}</div>
          <div className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            Pending immediate review
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>In Discussion</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{inReviewCount}</div>
          <div className="text-[11px] text-blue-600 font-medium">Contacted / Sample sent</div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Quoted / Converted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{convertedCount}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Rate delivered / converted</div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. Search & Filter Bar                                    */}
      {/* ========================================================= */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by client name, mobile phone, service, or specs..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {['All', ...ALL_STATUSES].map((st) => {
              const count = st === 'All' 
                ? quotes.length 
                : quotes.filter(q => (q.status || 'New').toLowerCase() === st.toLowerCase()).length;

              const active = statusFilter === st;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  <span>{st}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-slate-800 text-rose-300' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. Quotes Table & Cards List                              */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {filteredQuotes.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <MessageSquareQuote className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No quote requests found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'No inquiries match your current search query or status filter. Try clearing filters.'
                : 'Customer custom quote requests submitted via website forms or WhatsApp will appear here in real-time.'}
            </p>
            {(searchQuery || statusFilter !== 'All') && (
              <button
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-4 pl-6">Client / Contact</th>
                    <th className="p-4">Print Service / Category</th>
                    <th className="p-4">Est. Qty & Specs</th>
                    <th className="p-4">Date Received</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredQuotes.map((q) => {
                    const id = q.id || `quote-${Date.now()}`;
                    const name = q.clientName || q.customerName || q.name || 'Client';
                    const phone = q.phone || q.customerPhone || '';
                    const email = q.email || q.customerEmail || '';
                    const company = q.companyName;
                    const service = q.serviceRequired || q.productCategory || q.category || 'Commercial Printing';
                    const qty = q.estimatedQuantity || q.quantity || '500';
                    const specs = q.projectDescription || q.specialInstructions || q.specifications || '';
                    const dateStr = q.createdAt ? new Date(q.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Recent';
                    const statusBadge = getStatusBadge(q.status);

                    return (
                      <tr key={id} className="hover:bg-slate-50/70 transition-colors group">
                        
                        {/* Client details */}
                        <td className="p-4 pl-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 text-sm">{name}</span>
                              {company && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                                  {company}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                              {phone && (
                                <a 
                                  href={`tel:${phone}`}
                                  className="flex items-center gap-1 hover:text-[#FF0038] font-mono transition-colors"
                                >
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{phone}</span>
                                </a>
                              )}
                              {email && (
                                <a 
                                  href={`mailto:${email}`}
                                  className="flex items-center gap-1 hover:text-rose-600 transition-colors truncate max-w-[150px]"
                                >
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="truncate">{email}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Service / Category */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs">
                              <Layers className="w-3.5 h-3.5 text-[#FF0038]" />
                              {service}
                            </span>
                            {(q.paperGsm || q.finish || q.finishType) && (
                              <div className="text-[10px] text-slate-500 font-medium">
                                {[q.paperGsm, q.finish || q.finishType].filter(Boolean).join(' • ')}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Quantity & Specs */}
                        <td className="p-4">
                          <div className="space-y-1 max-w-xs">
                            <div className="font-mono font-bold text-slate-900 text-xs">
                              {qty} <span className="text-[10px] text-slate-500 font-normal">units</span>
                            </div>
                            {specs ? (
                              <p className="text-[11px] text-slate-500 line-clamp-1 italic" title={specs}>
                                "{specs}"
                              </p>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">No notes provided</span>
                            )}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-slate-500 whitespace-nowrap text-xs">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{dateStr}</span>
                          </div>
                        </td>

                        {/* Status dropdown */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={q.status || 'New'}
                              onChange={(e) => updateQuoteStatus(id, e.target.value)}
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border appearance-none pr-6 cursor-pointer focus:outline-none transition-colors ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                            >
                              {ALL_STATUSES.map(st => (
                                <option key={st} value={st} className="bg-white text-slate-900 font-medium">
                                  {st}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className={`w-3.5 h-3.5 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none ${statusBadge.text}`} />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="p-4 pr-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            
                            {/* WhatsApp Direct Reply */}
                            {phone && (
                              <button
                                onClick={() => handleOpenWhatsApp(q)}
                                title="Chat on WhatsApp"
                                className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4 fill-emerald-600" />
                              </button>
                            )}

                            {/* View Full Modal */}
                            <button
                              onClick={() => setSelectedQuote(q)}
                              title="View Quote Details"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Convert to Order */}
                            <button
                              onClick={() => handleConvertToOrder(q)}
                              title="Convert to Order"
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#FF0038] transition-colors cursor-pointer"
                            >
                              <ShoppingCart className="w-4 h-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setQuoteToDelete(q)}
                              title="Delete Quote"
                              className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredQuotes.map((q) => {
                const id = q.id || `quote-${Date.now()}`;
                const name = q.clientName || q.customerName || q.name || 'Client';
                const phone = q.phone || q.customerPhone || '';
                const email = q.email || q.customerEmail || '';
                const service = q.serviceRequired || q.productCategory || q.category || 'Commercial Printing';
                const qty = q.estimatedQuantity || q.quantity || '500';
                const specs = q.projectDescription || q.specialInstructions || q.specifications || '';
                const statusBadge = getStatusBadge(q.status);

                return (
                  <div key={id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-slate-900 text-sm">{name}</h4>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{phone}</div>
                      </div>
                      
                      <div className="relative">
                        <select
                          value={q.status || 'New'}
                          onChange={(e) => updateQuoteStatus(id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border appearance-none pr-5 cursor-pointer ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                        >
                          {ALL_STATUSES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>{service}</span>
                        <span className="font-mono text-[#FF0038]">{qty} units</span>
                      </div>
                      {specs && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                          "{specs}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => setSelectedQuote(q)}
                        className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Specs</span>
                      </button>

                      {phone && (
                        <button
                          onClick={() => handleOpenWhatsApp(q)}
                          className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <button
                        onClick={() => setQuoteToDelete(q)}
                        className="p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </>
        )}

      </div>

      {/* ========================================================= */}
      {/* 5. Full Quote Inspection Modal                            */}
      {/* ========================================================= */}
      {selectedQuote && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedQuote(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200 my-auto text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setSelectedQuote(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  <span>Wholesale Specification Record</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {selectedQuote.clientName || selectedQuote.customerName || selectedQuote.name || 'Client Inquiry'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  ID: {selectedQuote.id || 'N/A'} • Submitted: {selectedQuote.createdAt ? new Date(selectedQuote.createdAt).toLocaleString('en-IN') : 'Recent'}
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 text-xs">
              
              {/* Client Contact Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Client Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-800 font-medium">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Contact Person:</span>
                    <span className="font-bold text-sm text-slate-900">{selectedQuote.clientName || selectedQuote.customerName || selectedQuote.name || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Phone Number:</span>
                    <a href={`tel:${selectedQuote.phone || selectedQuote.customerPhone}`} className="font-bold text-sm text-[#FF0038] font-mono hover:underline">
                      {selectedQuote.phone || selectedQuote.customerPhone || 'Not provided'}
                    </a>
                  </div>
                  {selectedQuote.email && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Email Address:</span>
                      <a href={`mailto:${selectedQuote.email}`} className="text-slate-700 hover:underline">
                        {selectedQuote.email}
                      </a>
                    </div>
                  )}
                  {selectedQuote.companyName && (
                    <div>
                      <span className="text-slate-400 block text-[10px]">Company / Organization:</span>
                      <span className="text-slate-800 font-semibold">{selectedQuote.companyName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Print Job Specifications */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Print Job Requirements</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Item / Service:</span>
                    <span className="font-bold text-slate-900">{selectedQuote.serviceRequired || selectedQuote.productCategory || selectedQuote.category || 'Printing'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Estimated Quantity:</span>
                    <span className="font-bold font-mono text-[#FF0038] text-sm">{selectedQuote.estimatedQuantity || selectedQuote.quantity || '500'} pcs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Paper GSM:</span>
                    <span className="font-semibold text-slate-800">{selectedQuote.paperGsm || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Finish / Coating:</span>
                    <span className="font-semibold text-slate-800">{selectedQuote.finish || selectedQuote.finishType || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Current Status:</span>
                    <span className="font-bold text-slate-900">{selectedQuote.status || 'New'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] mb-1">Customer Description & Notes:</span>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-sans text-xs">
                    {selectedQuote.projectDescription || selectedQuote.specialInstructions || selectedQuote.specifications || 'No additional custom specifications mentioned.'}
                  </div>
                </div>
              </div>

              {/* Status Update Quick Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">Update Docket Status:</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_STATUSES.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        if (selectedQuote.id) {
                          updateQuoteStatus(selectedQuote.id, st);
                          setSelectedQuote({ ...selectedQuote, status: st });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        (selectedQuote.status || 'New') === st
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => handleOpenWhatsApp(selectedQuote)}
                  className="flex-1 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-slate-950 font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <MessageSquare className="w-4 h-4 fill-current" />
                  <span>Send Quote on WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    const q = selectedQuote;
                    setSelectedQuote(null);
                    handleConvertToOrder(q);
                  }}
                  className="py-2.5 px-4 bg-[#FF0038] hover:bg-rose-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Convert to Order</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. Manual Add In-Person / Phone Quote Modal               */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-auto text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 relative">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  <Plus className="w-3 h-3" />
                  <span>Manual Inquiry Entry</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Log Phone or Counter Quote
                </h3>
                <p className="text-xs text-slate-400">
                  Record custom requirements for walk-in or telephone clients.
                </p>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateManualQuote} className="p-5 sm:p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="e.g. Ramesh Kadam"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 9822334455"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. ramesh@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Company Name (Optional)</label>
                  <input
                    type="text"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    placeholder="e.g. Kadam Enterprises"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Service / Category</label>
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="e.g. Visiting Cards, Packaging Boxes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Quantity</label>
                  <input
                    type="text"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    placeholder="e.g. 500, 1000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Paper GSM</label>
                  <input
                    type="text"
                    value={newPaperGsm}
                    onChange={(e) => setNewPaperGsm(e.target.value)}
                    placeholder="e.g. 350 GSM, 170 GSM Art"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Finish / Coating</label>
                  <input
                    type="text"
                    value={newFinish}
                    onChange={(e) => setNewFinish(e.target.value)}
                    placeholder="e.g. Velvet Matte, Spot UV, Gold Foil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Specifications & Special Instructions</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="e.g. Round corners required, urgent 2-day delivery needed..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#FF0038] hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Save Quote Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. Delete Confirmation Modal                              */}
      {/* ========================================================= */}
      {quoteToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setQuoteToDelete(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Delete Quote Inquiry?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete the quote inquiry from{' '}
                <strong className="text-slate-800">
                  {quoteToDelete.clientName || quoteToDelete.customerName || quoteToDelete.name || 'this client'}
                </strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setQuoteToDelete(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (quoteToDelete.id) {
                    deleteQuote(quoteToDelete.id);
                  }
                  setQuoteToDelete(null);
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-sm"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
