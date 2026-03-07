import { useEffect, useState } from "react";
import GlassCard from "../../components/GlassCard";
import api from "../../services/api";

export default function FacultyClassesPage() {
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadClasses() {
      try {
        const response = await api.get("/faculty/classes");
        setClasses(response.data.classes || []);
      } catch (requestError) {
        setError(requestError?.response?.data?.message || "Failed to load classes");
      }
    }
    loadClasses();
  }, []);

  return (
    <GlassCard>
      <h3 className="font-display text-lg text-white">My Classes</h3>
      {error ? <p className="mt-3 text-red-300">{error}</p> : null}
      <div className="mt-4 space-y-3">
        {classes.map((item) => (
          <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-soft">
              Year {item.year} | Section {item.section} | {item.department}
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
