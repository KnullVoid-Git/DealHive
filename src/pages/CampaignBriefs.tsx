import React, { useState } from 'react';
import { Sliders, Sparkles, FileText, Plus, ChevronRight, PenTool, ShieldAlert, CheckSquare, Paperclip } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, Button, InputField } from '../components';

interface BriefTemplate {
  id: string;
  campaignTitle: string;
  dealType: string;
  talkingPoints: string[];
  hookFocus: string;
  scriptingG: string;
  restrictions: string[];
  creativeFreedom: number; // 0 to 100
  complianceChecklist: string[];
  referenceUrls: string[];
}

const INITIAL_TEMPLATES: BriefTemplate[] = [
  {
    id: 'brief_samsung_galaxy',
    campaignTitle: 'Galaxy S26 Launch Integration (Tech/PR)',
    dealType: 'Video Integration',
    talkingPoints: [
      'Highlight Galaxy S26 Ultra’s new AI generative nightography camera.',
      'Showcase real-time content translation and transcription in daily vlogs.',
      'Mention $150 credit checkout incentive on Samsung.com links.'
    ],
    hookFocus: 'Nightography low-light photos comparison with default phone cameras.',
    scriptingG: 'Must place mid-roll sponsorship segment within the first 5 minutes of vlogs.',
    restrictions: ['Do not mention other mobile brands (Apple, Google, OnePlus).', 'No swearing or politically sensitive remarks.'],
    creativeFreedom: 55, // Guided
    complianceChecklist: [
      'Show S26 Ultra low light photos comparisons on screen.',
      'Demonstrate real-time AI conversation translation.',
      'Add tracking promo link in top 2 lines of video description.'
    ],
    referenceUrls: ['https://samsung.com/galaxy-s26-assets/logo.png', 'https://samsung.com/brand-identity.pdf']
  },
  {
    id: 'brief_nordvpn_protect',
    campaignTitle: 'NordVPN Cybersecurity dedicated packages',
    dealType: 'Dedicated Video',
    talkingPoints: [
      'Explain the danger of public Wi-Fi access at airports or coffee shops.',
      'Mention NordVPN threat protection and automated malicious ad block.',
      'Highlight 68% discount offer on the 2-year cybersecurity bundle.'
    ],
    hookFocus: 'Live simulation of intercepting non-encrypted network connection packages.',
    scriptingG: '60-second dedicated segment with active screen captures of the NordVPN dashboard client.',
    restrictions: ['Do not show competing VPN software.', 'Must include active disclaimer that security cannot be 100% guaranteed.'],
    creativeFreedom: 35, // Scripted
    complianceChecklist: [
      'Show active screen-capture of threat protection panel.',
      'Verbally list the 30-day money-back guarantee.',
      'Add dedicated tracking link overlays.'
    ],
    referenceUrls: ['https://nordvpn.com/brand-kit/logo-dark.png']
  },
  {
    id: 'brief_lumen_wellness',
    campaignTitle: 'Lumen Health wellness outlines',
    dealType: 'Video Integration',
    talkingPoints: [
      'Showcase breath check tracking metabolism routines on waking up.',
      'Demonstrate personalized metabolic food suggestions on the Lumen client.',
      'Promote $50 coupon checkout discounts code.'
    ],
    hookFocus: 'Testing morning routine breaths and showing how energy limits are updated.',
    scriptingG: 'Organic integration seamlessly matching health and wellness content topics.',
    restrictions: ['Do not claim Lumen cures metabolic diseases.', 'Keep content upbeat and positive.'],
    creativeFreedom: 85, // Total Creative Freedom
    complianceChecklist: [
      'Incorporate metabolic breath check into your natural morning routine.',
      'Display customized coupon code "LUMEN50" on screen.'
    ],
    referenceUrls: ['https://lumen.me/assets/wellness-identity-guide.pdf']
  }
];

export const CampaignBriefs: React.FC = () => {
  const [templates, setTemplates] = useState<BriefTemplate[]>(INITIAL_TEMPLATES);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('brief_samsung_galaxy');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form states for creating brief
  const [newTitle, setNewTitle] = useState('');
  const [newDealType, setNewDealType] = useState('Video Integration');
  const [newHookFocus, setNewHookFocus] = useState('');
  const [newScriptingInstructions, setNewScriptingInstructions] = useState('');
  const [newTalkingPoints, setNewTalkingPoints] = useState('');
  const [newRestrictions, setNewRestrictions] = useState('');
  const [newCreativeFreedom, setNewCreativeFreedom] = useState<number>(50);
  const [newComplianceChecklist, setNewComplianceChecklist] = useState('');
  const [newReferenceUrls, setNewReferenceUrls] = useState('');

  const currentTemplate = templates.find(t => t.id === selectedTemplateId) || templates[0];

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newHookFocus) {
      toast.error('Please enter a brief title and hook focus.');
      return;
    }

    const tPoints = newTalkingPoints.split('\n').filter(line => line.trim().length > 0);
    const restrictionsList = newRestrictions.split('\n').filter(line => line.trim().length > 0);
    const complianceList = newComplianceChecklist.split('\n').filter(line => line.trim().length > 0);
    const referenceList = newReferenceUrls.split('\n').filter(line => line.trim().length > 0);

    const newBrief: BriefTemplate = {
      id: 'brief_' + Math.random().toString(36).substring(2, 7),
      campaignTitle: newTitle,
      dealType: newDealType,
      talkingPoints: tPoints.length > 0 ? tPoints : ['Provide detailed metabolic benefits or USP listings.'],
      hookFocus: newHookFocus,
      scriptingG: newScriptingInstructions || 'Standard 60s integration guidelines.',
      restrictions: restrictionsList.length > 0 ? restrictionsList : ['No competitor sponsorships.', 'Keep content PG.'],
      creativeFreedom: newCreativeFreedom,
      complianceChecklist: complianceList.length > 0 ? complianceList : ['Display coupon code on screen.', 'Link in top line description.'],
      referenceUrls: referenceList.length > 0 ? referenceList : ['https://dealhive.com/style-guides/default.pdf']
    };

    setTemplates([...templates, newBrief]);
    setSelectedTemplateId(newBrief.id);
    toast.success('New campaign brief template generated with Creative Freedom parameters!');
    
    // Reset fields
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewHookFocus('');
    setNewScriptingInstructions('');
    setNewTalkingPoints('');
    setNewRestrictions('');
    setNewCreativeFreedom(50);
    setNewComplianceChecklist('');
    setNewReferenceUrls('');
  };

  const getFreedomLevel = (score: number) => {
    if (score < 30) {
      return {
        text: 'Strictly Scripted (0-30%)',
        desc: 'Tight scripting requirements with pre-written sentences and overlays. Exact compliance is mandatory.',
        color: 'text-red-500 bg-red-500/10 border-red-500/20'
      };
    } else if (score < 70) {
      return {
        text: 'Guided Framework (31-70%)',
        desc: 'Clear list of talking points and USPs provided. Visual guides and compliance checklists, but content flow is styled by creator.',
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/20'
      };
    } else {
      return {
        text: 'Total Creative Freedom (71-100%)',
        desc: 'No strict compliance or scripting rules. Creator is free to showcase the brand integration naturally inside their vlog structure.',
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
      };
    }
  };

  return (
    <div className="w-full max-w-[1140px] mx-auto py-7 px-8 space-y-6 select-none animate-stagger-item">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex flex-col select-none">
          <h2 className="text-xl font-bold text-text-primary sora-heading leading-none">Sponsorship Brief Builder</h2>
          <p className="text-xs text-text-muted mt-1.5 leading-none">
            Orchestrate talking points, strict restrictions, creative freedom parameters, and creator compliance checklists.
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create Brief Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: List of briefs */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Campaign Briefs</h3>
          <div className="space-y-3">
            {templates.map(p => {
              const isSelected = p.id === selectedTemplateId;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedTemplateId(p.id)}
                  className={`p-4 border rounded-xl cursor-pointer transition-all flex items-center justify-between group ${
                    isSelected ? 'border-brand bg-brand-light/10' : 'border-border bg-surface hover:bg-surface-2/30 hover:border-text-muted'
                  }`}
                >
                  <div className="flex flex-col min-w-0 leading-tight">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-brand' : 'text-text-primary'}`}>
                      {p.campaignTitle}
                    </span>
                    <span className="text-[10px] text-text-muted mt-1 font-semibold">{p.dealType}</span>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform ${
                      isSelected ? 'text-brand translate-x-0.5' : 'text-text-faint group-hover:text-text-secondary'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Brief details */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-xs font-bold text-text-primary sora-heading uppercase tracking-wider">Brief Parameters details</h3>
          {currentTemplate && (
            <Card variant="standard" className="p-6 space-y-6 bg-surface border border-border">
              <div className="flex justify-between items-start border-b border-border/60 pb-4">
                <div className="flex flex-col leading-tight select-none">
                  <span className="text-sm font-bold text-text-primary sora-heading">{currentTemplate.campaignTitle}</span>
                  <span className="text-[10px] font-bold text-brand uppercase tracking-wider mt-1.5">
                    Format: {currentTemplate.dealType}
                  </span>
                </div>
                <div className="flex items-center space-x-1 bg-brand-light/30 border border-brand/10 text-brand px-2.5 py-1 rounded text-[10px] font-bold uppercase leading-none">
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  <span>Structured Outline</span>
                </div>
              </div>

              {/* Creative Freedom Gauge */}
              <div className="space-y-2 select-none border-b border-border/40 pb-5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                    <Sliders className="w-4 h-4 text-brand" />
                    <span>Creative Freedom Gauge</span>
                  </h4>
                  <span className={`px-2.5 py-0.5 border rounded-[4px] text-[9.5px] font-bold uppercase tracking-wider ${getFreedomLevel(currentTemplate.creativeFreedom).color}`}>
                    {getFreedomLevel(currentTemplate.creativeFreedom).text}
                  </span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed pl-6">
                  {getFreedomLevel(currentTemplate.creativeFreedom).desc}
                </p>
              </div>

              {/* Integration Hook Focus */}
              <div className="space-y-2 select-none">
                <h4 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span>Integration Hook Focus</span>
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed bg-surface-2/45 p-3.5 rounded-lg border border-border/40">
                  {currentTemplate.hookFocus}
                </p>
              </div>

              {/* Talking Points */}
              <div className="space-y-3 select-none">
                <h4 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                  <PenTool className="w-4 h-4 text-brand" />
                  <span>Creator Talking Points & USPs</span>
                </h4>
                <ul className="space-y-2 text-xs text-text-secondary leading-relaxed pl-5 list-disc font-medium">
                  {currentTemplate.talkingPoints.map((pt, idx) => (
                    <li key={idx} className="leading-relaxed hover:text-text-primary transition-colors">
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brand Restrictions */}
              {currentTemplate.restrictions && currentTemplate.restrictions.length > 0 && (
                <div className="space-y-3.5 select-none bg-red-500/[0.02] border border-red-500/20 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-red-500 flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Hard Brand Restrictions & Outlines</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-red-700 dark:text-red-300 leading-relaxed pl-5 list-disc font-semibold">
                    {currentTemplate.restrictions.map((r, idx) => (
                      <li key={idx}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance Checklist */}
              {currentTemplate.complianceChecklist && currentTemplate.complianceChecklist.length > 0 && (
                <div className="space-y-3 select-none border-t border-border/60 pt-4">
                  <h4 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                    <CheckSquare className="w-4 h-4 text-brand" />
                    <span>Submission Compliance Checklist</span>
                  </h4>
                  <ul className="space-y-2 pl-5">
                    {currentTemplate.complianceChecklist.map((c, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-xs text-text-secondary">
                        <div className="w-4 h-4 border border-border rounded flex items-center justify-center text-[10px] font-bold text-brand">
                          {idx + 1}
                        </div>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reference Guidelines */}
              {currentTemplate.referenceUrls && currentTemplate.referenceUrls.length > 0 && (
                <div className="space-y-3.5 select-none border-t border-border/60 pt-4">
                  <h4 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-brand" />
                    <span>References & Guidelines Assets</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentTemplate.referenceUrls.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-surface-2 hover:bg-surface-3 border border-border text-[10px] font-bold text-text-secondary rounded-lg flex items-center space-x-1.5 transition-all"
                      >
                        <span>📎 Reference Asset #{idx + 1}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Scripting Compliance */}
              {currentTemplate.scriptingG && (
                <div className="space-y-2 select-none border-t border-border/60 pt-4">
                  <h4 className="text-xs font-bold text-text-primary flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-brand" />
                    <span>Scripting & Compliance Instructions</span>
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    ⚠️ {currentTemplate.scriptingG}
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            variant="standard"
            className="w-full max-w-[480px] max-h-[90vh] overflow-y-auto border border-border p-6 shadow-2xl flex flex-col justify-between bg-surface"
          >
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <h3 className="text-sm font-bold text-text-primary sora-heading border-b border-border pb-2.5">
                Configure Sponsorship Brief Template
              </h3>
              
              <InputField
                label="Brief / Campaign Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. NordVPN Tech Dedicated Review"
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Format Type</label>
                  <select
                    value={newDealType}
                    onChange={(e) => setNewDealType(e.target.value)}
                    className="h-10 px-2 border border-border bg-surface text-xs rounded-md outline-none font-semibold text-text-secondary"
                  >
                    <option value="Video Integration">Video Integration</option>
                    <option value="Dedicated Video">Dedicated Video</option>
                    <option value="Shorts Package">Shorts / Reels Package</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary uppercase">
                    <span>Creative Freedom</span>
                    <span className="font-mono text-brand">{newCreativeFreedom}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={newCreativeFreedom}
                    onChange={(e) => setNewCreativeFreedom(Number(e.target.value))}
                    className="w-full accent-brand h-1 bg-border rounded-lg appearance-none cursor-pointer mt-2"
                  />
                </div>
              </div>

              <InputField
                label="Hook Focus (Key initial attention puller)"
                value={newHookFocus}
                onChange={(e) => setNewHookFocus(e.target.value)}
                placeholder="Describe the best visual hooks or comparison frames..."
                required
              />

              <InputField
                label="Compliance Scripting Instructions"
                value={newScriptingInstructions}
                onChange={(e) => setNewScriptingInstructions(e.target.value)}
                placeholder="e.g. mid-roll required, display download codes on screen..."
              />

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  Talking Points USPs (One per line)
                </label>
                <textarea
                  value={newTalkingPoints}
                  onChange={(e) => setNewTalkingPoints(e.target.value)}
                  placeholder={"Highlight Nightography AI...\nPromote $150 shopping credit..."}
                  rows={2}
                  className="w-full p-2.5 border border-border bg-surface text-xs rounded-md outline-none focus:border-brand font-semibold text-text-secondary"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  Hard Restrictions (One per line)
                </label>
                <textarea
                  value={newRestrictions}
                  onChange={(e) => setNewRestrictions(e.target.value)}
                  placeholder={"Do not show competitor laptops...\nNo swearing or inappropriate comments..."}
                  rows={2}
                  className="w-full p-2.5 border border-border bg-surface text-xs rounded-md outline-none focus:border-brand font-semibold text-text-secondary"
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-text-secondary uppercase">
                  Compliance Checklist (One per line)
                </label>
                <textarea
                  value={newComplianceChecklist}
                  onChange={(e) => setNewComplianceChecklist(e.target.value)}
                  placeholder={"Overlay unboxing code for 10s...\nLink in first 2 lines description..."}
                  rows={2}
                  className="w-full p-2.5 border border-border bg-surface text-xs rounded-md outline-none focus:border-brand font-semibold text-text-secondary"
                />
              </div>

              <InputField
                label="Reference Guidelines Assets URLs (One per line)"
                value={newReferenceUrls}
                onChange={(e) => setNewReferenceUrls(e.target.value)}
                placeholder="e.g. https://brand.com/style-guides.pdf"
              />

              <div className="flex justify-end space-x-2 pt-4 border-t border-border flex-shrink-0">
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Brief Template
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};