"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { CheckCircle, LogOut } from "lucide-react";

type Candidate = {
  id: string;
  number: number;
  name: string;
  vision: string;
  mission: string;
  image_url: string;
};

export default function VotePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [voter, setVoter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const voterStr = localStorage.getItem("voter");
    if (!voterStr) {
      router.push("/");
      return;
    }
    
    const voterData = JSON.parse(voterStr);
    if (voterData.has_voted) {
      router.push("/");
      return;
    }
    
    setVoter(voterData);
    fetchCandidates();
  }, [router]);

  const fetchCandidates = async () => {
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .order("number", { ascending: true });
      
    if (data && !error) {
      setCandidates(data);
    }
    setLoading(false);
  };

  const handleVote = async () => {
    if (!selectedCandidate || !voter) return;
    
    const confirmVote = window.confirm("Apakah Anda yakin dengan pilihan ini? Pilihan tidak dapat diubah.");
    if (!confirmVote) return;

    setSubmitting(true);
    
    const { error } = await supabase
      .from("voters")
      .update({
        has_voted: true,
        voted_for: selectedCandidate
      })
      .eq("id", voter.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        localStorage.removeItem("voter");
        router.push("/");
      }, 3000);
    } else {
      alert("Terjadi kesalahan saat menyimpan suara.");
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("voter");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white border border-slate-200 shadow-xl rounded-2xl p-12 flex flex-col items-center max-w-lg text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-24 h-24 text-green-500 mb-6" />
          </motion.div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Terima Kasih!</h2>
          <p className="text-slate-600 font-medium">
            Suara Anda berhasil disimpan. Anda akan diarahkan ke halaman utama dalam beberapa detik...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Kandidat <span className="text-blue-600">Ketua OSIS</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Selamat datang, {voter?.username}. Silakan pilih kandidat terbaik menurut Anda.</p>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors border border-red-100 font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer border-2 shadow-sm ${
                selectedCandidate === candidate.id 
                  ? "border-blue-600 shadow-blue-600/20 scale-[1.02]" 
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              }`}
              onClick={() => setSelectedCandidate(candidate.id)}
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100">
                {candidate.image_url ? (
                  <img 
                    src={candidate.image_url} 
                    alt={candidate.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">Foto Kandidat</div>
                )}
                <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-xl font-bold text-slate-900 border border-slate-200 shadow-sm">
                  {candidate.number}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{candidate.name}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Visi</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{candidate.vision}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Misi</h4>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-line">{candidate.mission}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    selectedCandidate === candidate.id 
                      ? "border-blue-600 bg-blue-600" 
                      : "border-slate-300"
                  }`}>
                    {selectedCandidate === candidate.id && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedCandidate && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-slate-500 font-medium">Anda memilih kandidat nomor</p>
              <p className="text-2xl font-bold text-slate-900">
                {candidates.find(c => c.id === selectedCandidate)?.name}
              </p>
            </div>
            <button
              onClick={handleVote}
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {submitting ? "Menyimpan..." : "Kirim Suara Sekarang"}
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
