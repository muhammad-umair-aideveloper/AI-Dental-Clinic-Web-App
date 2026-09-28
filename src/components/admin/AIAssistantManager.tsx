"use client";

import React, { useEffect, useState } from "react";
import {
  AISettings,
  CompanyService,
  CompanyFAQ,
  DEFAULT_AI_SETTINGS,
} from "@/lib/ai-types";
import {
  Bot,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Send,
  Building,
  Sliders,
  DollarSign,
  Clock,
  Shield,
  Phone,
  FileText,
  Key,
} from "lucide-react";

export function AIAssistantManager() {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active sub-tab
  const [subTab, setSubTab] = useState<"knowledge" | "instructions" | "test">("knowledge");

  // Interactive Live Testing inside Admin
  const [testPrompt, setTestPrompt] = useState("apki company kya service provide karti hai?");
  const [testResponse, setTestResponse] = useState<string>("");
  const [testLoading, setTestLoading] = useState(false);

  // Fetch settings on mount
  const fetchSettings = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/ai-settings");
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettings(data.settings);
      } else {
        setErrorMessage(data.error || "Failed to load AI settings");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Network error loading AI settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveSuccess(true);
        if (data.settings) setSettings(data.settings);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMessage(data.error || "Failed to save AI settings");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save AI settings");
    } finally {
      setSaving(false);
    }
  };

  // Run Test Chat Query
  const handleTestChat = async (promptToTest?: string) => {
    const q = promptToTest || testPrompt;
    if (!q.trim()) return;

    setTestLoading(true);
    setTestResponse("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: q }],
          language: "en",
        }),
      });

      if (!res.ok) {
        setTestResponse(`Error: Received status ${res.status}`);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setTestResponse("Error: No readable stream");
        return;
      }

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse Vercel AI SDK lines (e.g. 0:"text")
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("0:")) {
            try {
              const textContent = JSON.parse(line.substring(2));
              fullText += textContent;
              setTestResponse(fullText);
            } catch (e) {
              // ignore parse errors
            }
          }
        }
      }
    } catch (err: any) {
      setTestResponse("Test error: " + err?.message);
    } finally {
      setTestLoading(false);
    }
  };

  // Service helpers
  const handleAddService = () => {
    const newSrv: CompanyService = {
      id: "srv-" + Date.now(),
      name: "New Dental Service",
      description: "Service description and clinical details.",
      price: "Rs. 2,500",
      category: "General",
    };
    setSettings((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        services: [...prev.knowledge.services, newSrv],
      },
    }));
  };

  const handleRemoveService = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        services: prev.knowledge.services.filter((s) => s.id !== id),
      },
    }));
  };

  const handleUpdateService = (id: string, field: keyof CompanyService, val: string) => {
    setSettings((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        services: prev.knowledge.services.map((s) =>
          s.id === id ? { ...s, [field]: val } : s
        ),
      },
    }));
  };

  // FAQ helpers
  const handleAddFAQ = () => {
    const newFaq: CompanyFAQ = {
      id: "faq-" + Date.now(),
      question: "New Patient Question?",
      answer: "Accurate answer from Lahore Dental.",
      category: "General",
    };
    setSettings((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        faqs: [...prev.knowledge.faqs, newFaq],
      },
    }));
  };

  const handleRemoveFAQ = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        faqs: prev.knowledge.faqs.filter((f) => f.id !== id),
      },
    }));
  };

  const handleUpdateFAQ = (id: string, field: keyof CompanyFAQ, val: string) => {
    setSettings((prev) => ({
      ...prev,
      knowledge: {
        ...prev.knowledge,
        faqs: prev.knowledge.faqs.map((f) =>
          f.id === id ? { ...f, [field]: val } : f
        ),
      },
    }));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#04326d] mb-2" />
        <p className="text-sm font-medium text-slate-600 font-sans">
          Loading AI Knowledge & Instructions...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner & Save Action */}
      <div className="bg-white rounded-3xl p-6 border border-[#b2bed6]/40 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 h-8 rounded-xl bg-[#04326d] text-white flex items-center justify-center text-sm shadow-soft">
              🤖
            </span>
            <h2 className="text-xl font-heading font-extrabold text-[#001a4b]">
              AI Assistant & Knowledge Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
            Manage your clinic&apos;s verified knowledge base, pricing, refund timelines, and AI instructions.
            The AI chatbot strictly references this database to generate dynamic, fact-grounded responses in Roman Urdu and English.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={fetchSettings}
            disabled={loading || saving}
            title="Reload from Database"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-bold text-xs sm:text-sm shadow-soft transition-all cursor-pointer disabled:opacity-70"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All AI Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>AI Knowledge Base & Behavior Instructions successfully updated in database!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setSubTab("knowledge")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === "knowledge"
              ? "bg-[#04326d] text-white shadow-soft"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>1. Company Knowledge Base</span>
        </button>

        <button
          onClick={() => setSubTab("instructions")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === "instructions"
              ? "bg-[#04326d] text-white shadow-soft"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>2. AI Instructions & Behavior</span>
        </button>

        <button
          onClick={() => setSubTab("test")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
            subTab === "test"
              ? "bg-[#04326d] text-white shadow-soft"
              : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>3. Live Chat Simulator</span>
        </button>
      </div>

      {/* SUBTAB 1: Company Knowledge Base */}
      {subTab === "knowledge" && (
        <div className="space-y-6">
          {/* General Company & Contact Info */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#001a4b] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#04326d]" />
              Company Details & Contact Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Company / Clinic Name
                </label>
                <input
                  type="text"
                  value={settings.knowledge.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: { ...settings.knowledge, companyName: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Working Hours & Schedule
                </label>
                <input
                  type="text"
                  value={settings.knowledge.workingHours}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: { ...settings.knowledge, workingHours: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Company Description
                </label>
                <textarea
                  rows={2}
                  value={settings.knowledge.companyDescription}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: { ...settings.knowledge, companyDescription: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Helpline Phone Number
                </label>
                <input
                  type="text"
                  value={settings.knowledge.contactInfo.phone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: {
                        ...settings.knowledge,
                        contactInfo: {
                          ...settings.knowledge.contactInfo,
                          phone: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  WhatsApp Contact
                </label>
                <input
                  type="text"
                  value={settings.knowledge.contactInfo.whatsapp}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: {
                        ...settings.knowledge,
                        contactInfo: {
                          ...settings.knowledge.contactInfo,
                          whatsapp: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.knowledge.contactInfo.email}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: {
                        ...settings.knowledge,
                        contactInfo: {
                          ...settings.knowledge.contactInfo,
                          email: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Clinic Physical Address
                </label>
                <input
                  type="text"
                  value={settings.knowledge.contactInfo.address}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: {
                        ...settings.knowledge,
                        contactInfo: {
                          ...settings.knowledge.contactInfo,
                          address: e.target.value,
                        },
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Services & Pricing Management */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-base font-bold text-[#001a4b] flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#04326d]" />
                  Dental Services & Verified Pricing
                </h3>
                <p className="text-xs text-slate-500">
                  The AI references these exact service titles and prices when answering pricing queries.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddService}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="space-y-3">
              {settings.knowledge.services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Service Name
                      </label>
                      <input
                        type="text"
                        value={service.name}
                        onChange={(e) =>
                          handleUpdateService(service.id, "name", e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:border-[#04326d] outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                        Price / Pricing Range
                      </label>
                      <input
                        type="text"
                        value={service.price}
                        onChange={(e) =>
                          handleUpdateService(service.id, "price", e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:border-[#04326d] outline-none text-[#04326d]"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={service.category || "General"}
                          onChange={(e) =>
                            handleUpdateService(service.id, "category", e.target.value)
                          }
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#04326d] outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors mt-4"
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Service Description
                    </label>
                    <input
                      type="text"
                      value={service.description}
                      onChange={(e) =>
                        handleUpdateService(service.id, "description", e.target.value)
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#04326d] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Pricing Disclaimers & Notes
              </label>
              <textarea
                rows={2}
                value={settings.knowledge.pricingNotes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    knowledge: { ...settings.knowledge, pricingNotes: e.target.value },
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
              />
            </div>
          </div>

          {/* Refund, Cancellation & Business Policies */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#001a4b] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#04326d]" />
              Refund, Cancellation & Clinic Policies
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Refund Policy & Timeline (e.g. 3 to 5 business days)
                </label>
                <textarea
                  rows={4}
                  value={settings.knowledge.refundPolicy}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: { ...settings.knowledge, refundPolicy: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Appointment Cancellation Policy
                </label>
                <textarea
                  rows={4}
                  value={settings.knowledge.cancellationPolicy}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      knowledge: { ...settings.knowledge, cancellationPolicy: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Additional Business Policies (One per line)
              </label>
              <textarea
                rows={3}
                value={settings.knowledge.businessPolicies.join("\n")}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    knowledge: {
                      ...settings.knowledge,
                      businessPolicies: e.target.value.split("\n").filter((p) => p.trim()),
                    },
                  })
                }
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-mono text-xs"
              />
            </div>
          </div>

          {/* Frequently Asked Questions (FAQs) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h3 className="text-base font-bold text-[#001a4b] flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#04326d]" />
                  Frequently Asked Questions (FAQs)
                </h3>
                <p className="text-xs text-slate-500">
                  Common patient questions in English and Roman Urdu mapped to accurate answers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddFAQ}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add FAQ</span>
              </button>
            </div>

            <div className="space-y-3">
              {settings.knowledge.faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveFAQ(faq.id)}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete FAQ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Question (English / Roman Urdu)
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => handleUpdateFAQ(faq.id, "question", e.target.value)}
                      className="w-full pr-10 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:border-[#04326d] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Answer
                    </label>
                    <textarea
                      rows={2}
                      value={faq.answer}
                      onChange={(e) => handleUpdateFAQ(faq.id, "answer", e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white focus:border-[#04326d] outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI Instructions & Behavior */}
      {subTab === "instructions" && (
        <div className="space-y-6">
          {/* Identity & Persona */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#001a4b] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#04326d]" />
              AI Identity, Role & Audience
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  AI Role & Persona
                </label>
                <input
                  type="text"
                  value={settings.instructions.role}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: { ...settings.instructions, role: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Target Audience
                </label>
                <input
                  type="text"
                  value={settings.instructions.targetAudience}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: { ...settings.instructions, targetAudience: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tone & Manner
                </label>
                <input
                  type="text"
                  value={settings.instructions.tone}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: { ...settings.instructions, tone: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Response Length Guideline
                </label>
                <input
                  type="text"
                  value={settings.instructions.responseLength}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: { ...settings.instructions, responseLength: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Business Goals
                </label>
                <input
                  type="text"
                  value={settings.instructions.businessGoals}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: { ...settings.instructions, businessGoals: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>
            </div>
          </div>

          {/* Guardrails: Dos, Don'ts & Fallback Behavior */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#001a4b] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#04326d]" />
              Guardrails: What the AI Should & Should NOT Say
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-emerald-800 mb-1">
                  What the AI SHOULD Say (Dos - One per line)
                </label>
                <textarea
                  rows={4}
                  value={settings.instructions.dos.join("\n")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        dos: e.target.value.split("\n").filter((l) => l.trim()),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-emerald-200 bg-emerald-50/30 focus:border-emerald-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 mb-1">
                  What the AI MUST NOT Say (Don&apos;ts - One per line)
                </label>
                <textarea
                  rows={4}
                  value={settings.instructions.donts.join("\n")}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        donts: e.target.value.split("\n").filter((l) => l.trim()),
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/30 focus:border-rose-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  What To Do When Information Is Unavailable
                </label>
                <textarea
                  rows={3}
                  value={settings.instructions.whenInfoUnavailable}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        whenInfoUnavailable: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  When To Transfer To Human Support
                </label>
                <textarea
                  rows={3}
                  value={settings.instructions.whenTransferSupport}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        whenTransferSupport: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Language Behavior Policy
              </label>
              <textarea
                rows={3}
                value={settings.instructions.languageRules}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    instructions: {
                      ...settings.instructions,
                      languageRules: e.target.value,
                    },
                  })
                }
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-mono"
              />
            </div>
          </div>

          {/* AI Model & Secure Backend Configuration */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#001a4b] border-b border-slate-100 pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#04326d]" />
              AI Model & Backend Provider Settings (Secure)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  AI Provider
                </label>
                <select
                  value={settings.instructions.provider}
                  onChange={(e: any) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        provider: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none bg-white font-medium"
                >
                  <option value="openai">OpenAI</option>
                  <option value="groq">Groq (OpenAI-compatible)</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="custom">Custom Endpoint</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Model Name
                </label>
                <input
                  type="text"
                  placeholder="gpt-4o-mini"
                  value={settings.instructions.model}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        model: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Backend API Key (Encrypted Server-Side)
                </label>
                <input
                  type="password"
                  placeholder="sk-proj-••••••••"
                  value={settings.instructions.apiKey || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      instructions: {
                        ...settings.instructions,
                        apiKey: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none font-mono"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Protected: Stored securely in database and never exposed to website visitors.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Live Chat Simulator for Verification */}
      {subTab === "test" && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-base font-bold text-[#001a4b] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#04326d]" />
              Live AI Grounded Chat Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Test how the AI assistant answers various queries using your current database knowledge and instructions.
            </p>
          </div>

          {/* Quick preset tests requested by user */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase">
              Click to Run Required Test Queries:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                {
                  label: "1. Roman Urdu Services",
                  prompt: "apki company kya service provide karti hai?",
                },
                {
                  label: "2. Roman Urdu Refund",
                  prompt: "bhai refund kitnay din mein milta hai?",
                },
                {
                  label: "3. English Services",
                  prompt: "What services do you provide?",
                },
                {
                  label: "4. Mixed Urdu/English Signup",
                  prompt: "bhai signup ka process kya hai?",
                },
                {
                  label: "5. Unrelated Question",
                  prompt: "Pakistan ka capital kya hai?",
                },
              ].map((testCase, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setTestPrompt(testCase.prompt);
                    handleTestChat(testCase.prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#04326d] hover:text-white text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                >
                  {testCase.label}
                </button>
              ))}
            </div>
          </div>

          {/* Test Input Form */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Type any test query in English, Roman Urdu, or Mixed..."
              className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-[#04326d] outline-none"
            />
            <button
              type="button"
              onClick={() => handleTestChat()}
              disabled={testLoading || !testPrompt.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#04326d] hover:bg-[#001a4b] text-white font-bold text-sm shadow-soft transition-all cursor-pointer disabled:opacity-50"
            >
              {testLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run Query</span>
                </>
              )}
            </button>
          </div>

          {/* Response Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#001a4b]">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-[#04326d]" />
                Live AI Response Output:
              </span>
              {testLoading && (
                <span className="text-[#04326d] animate-pulse">Streaming response...</span>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-100 text-sm leading-relaxed whitespace-pre-wrap min-h-[80px] text-slate-800 font-sans">
              {testResponse || (
                <span className="text-slate-400 italic text-xs">
                  Click one of the buttons above or type a query to test live AI responses.
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
