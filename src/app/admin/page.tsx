"use client";

import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaPlus, FaSync, FaSignOutAlt, FaEdit } from "react-icons/fa";

export default function AdminDashboard() {
  const models = useQuery(api.admin.listAllModels);
  const upsertModel = useMutation(api.models.upsertModel);
  const fetchExternal = useAction(api.admin.fetchExternalModels);
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const [isAdding, setIsAdding] = useState(false);
  const [externalModels, setExternalModels] = useState<any[]>([]);
  const [loadingExternal, setLoadingExternal] = useState(false);
  const [formData, setFormData] = useState({
    model_code: "",
    display_name: "",
    description: "",
    type: "general" as "general" | "reasoning" | "conversational",
    provider_code: "",
    system_prompt: "You are a helpful AI assistant.",
    max_completion_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    stream: true,
    stop: null as string | null,
    provider: "groq" as "groq" | "openrouter",
    image_support: false,
    pdf_support: false,
    reasoning: false,
    active: true,
  });

  const handleFetchExternal = async (provider: "groq" | "openrouter") => {
    setLoadingExternal(true);
    try {
      const data = await fetchExternal({ provider });
      setExternalModels(data);
    } catch (err) {
      alert("Failed to fetch models from " + provider);
    } finally {
      setLoadingExternal(false);
    }
  };

  const autoFill = (m: any) => {
    setFormData({
      ...formData,
      model_code: m.id.toLowerCase().replace(/[^a-z0-9]/g, "_"),
      display_name: m.name,
      provider_code: m.id,
      provider: m.provider,
      reasoning: m.id.toLowerCase().includes("reasoning") || m.id.toLowerCase().includes("thought"),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await upsertModel(formData as any);
      setIsAdding(false);
      alert("Model saved successfully!");
    } catch (err) {
      alert("Failed to save model");
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-syne">Admin Dashboard</h1>
            <p className="text-text-secondary mt-1">Manage AI models and system configuration</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:bg-surface transition-colors"
            >
              <FaSignOutAlt /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Models List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Active Models</h2>
                <button
                  onClick={() => setIsAdding(!isAdding)}
                  className="bg-accent text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-accent-strong transition-colors"
                >
                  <FaPlus /> {isAdding ? "Cancel" : "Add Model"}
                </button>
              </div>

              <div className="space-y-4">
                {models?.map((model) => (
                  <div key={model._id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-background hover:border-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${model.active ? 'bg-success' : 'bg-text-muted'}`} />
                      <div>
                        <div className="font-bold">{model.display_name || model.model_code}</div>
                        <div className="text-xs text-text-secondary font-mono">{model.provider_code} | {model.provider}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setFormData({
                            model_code: model.model_code,
                            display_name: model.display_name || "",
                            description: model.description || "",
                            type: model.type || "general",
                            provider_code: model.provider_code,
                            system_prompt: model.system_prompt,
                            max_completion_tokens: model.max_completion_tokens,
                            temperature: model.temperature,
                            top_p: model.top_p,
                            stream: model.stream,
                            stop: model.stop,
                            provider: model.provider,
                            image_support: model.image_support || false,
                            pdf_support: model.pdf_support || false,
                            reasoning: model.reasoning || false,
                            active: model.active,
                          });
                          setIsAdding(true);
                        }}
                        className="p-2 hover:bg-surface rounded-lg text-text-secondary hover:text-accent transition-colors"
                      >
                        <FaEdit />
                      </button>
                    </div>
                  </div>
                ))}
                {!models && <div className="text-center py-8 text-text-muted">Loading models...</div>}
              </div>
            </div>
          </div>

          {/* Model Discovery / Add Form */}
          <div className="space-y-6">
            {isAdding ? (
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Model Configuration</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Provider</label>
                      <select 
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent"
                        value={formData.provider}
                        onChange={(e) => setFormData({...formData, provider: e.target.value as any})}
                      >
                        <option value="groq">Groq</option>
                        <option value="openrouter">OpenRouter</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Model Code</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent"
                        value={formData.model_code}
                        onChange={(e) => setFormData({...formData, model_code: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Display Name</label>
                      <input 
                        type="text" 
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent"
                        value={formData.display_name}
                        onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Provider Code</label>
                      <input 
                        type="text" 
                        required
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent font-mono text-sm"
                        value={formData.provider_code}
                        onChange={(e) => setFormData({...formData, provider_code: e.target.value})}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">System Prompt</label>
                      <textarea 
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent h-24"
                        value={formData.system_prompt}
                        onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Temp</label>
                      <input 
                        type="number" step="0.1"
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent"
                        value={formData.temperature}
                        onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-1">Max Tokens</label>
                      <input 
                        type="number"
                        className="w-full bg-background border border-border rounded-xl p-2.5 outline-none focus:border-accent"
                        value={formData.max_completion_tokens}
                        onChange={(e) => setFormData({...formData, max_completion_tokens: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 py-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.image_support} onChange={(e) => setFormData({...formData, image_support: e.target.checked})} className="accent-accent" />
                      <span className="text-sm">Vision</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.reasoning} onChange={(e) => setFormData({...formData, reasoning: e.target.checked})} className="accent-accent" />
                      <span className="text-sm">Reasoning</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({...formData, active: e.target.checked})} className="accent-accent" />
                      <span className="text-sm">Active</span>
                    </label>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent-strong transition-colors mt-4"
                  >
                    Save Model
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-surface rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-6">Discover Models</h2>
                <div className="flex gap-2 mb-6">
                  <button 
                    onClick={() => handleFetchExternal("groq")}
                    disabled={loadingExternal}
                    className="flex-1 bg-surface border border-border px-3 py-2 rounded-xl text-xs font-bold hover:border-accent transition-colors disabled:opacity-50"
                  >
                    Fetch Groq
                  </button>
                  <button 
                    onClick={() => handleFetchExternal("openrouter")}
                    disabled={loadingExternal}
                    className="flex-1 bg-surface border border-border px-3 py-2 rounded-xl text-xs font-bold hover:border-accent transition-colors disabled:opacity-50"
                  >
                    Fetch OpenRouter
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {loadingExternal && <div className="text-center py-4"><FaSync className="animate-spin inline mr-2" /> Fetching...</div>}
                  {externalModels.map((m) => (
                    <div key={m.id} className="group p-3 rounded-xl border border-border bg-background hover:border-accent/50 transition-all">
                      <div className="text-xs font-bold truncate mb-2">{m.name}</div>
                      <button 
                        onClick={() => {
                          autoFill(m);
                          setIsAdding(true);
                        }}
                        className="w-full py-1.5 text-[10px] uppercase tracking-widest font-bold bg-accent/10 text-accent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use This Model
                      </button>
                    </div>
                  ))}
                  {externalModels.length === 0 && !loadingExternal && (
                    <div className="text-center py-8 text-text-muted text-sm italic">
                      Fetch models to see available options from API providers
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
