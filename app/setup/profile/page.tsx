"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SetupProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [job, setJob] = useState("");
  const [location, setLocation] = useState("");
  const [hobbies, setHobbies] = useState("");
  const [sports, setSports] = useState("");
  const [relationshipStatus, setRelationshipStatus] =
    useState("");

  const [childrenInfo, setChildrenInfo] =
    useState("");

  const [interests, setInterests] = useState("");

  const [communicationStyle, setCommunicationStyle] =
    useState("");

  const [shortBio, setShortBio] = useState("");

  async function saveProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from("user_profiles")
      .insert([
        {
          user_id: user.id,
          full_name: fullName,
          age: Number(age),
          gender,
          job,
          location,
          hobbies,
          sports,
          relationship_status: relationshipStatus,
          children_info: childrenInfo,
          interests,
          communication_style: communicationStyle,
          short_bio: shortBio,
        },
      ]);

    console.log("PROFILE ERROR:", error);

    setLoading(false);

    if (!error) {
      router.push("/setup");
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
          GhostMe Setup
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Chi sei?
        </h1>

        <p className="mt-4 text-zinc-400">
          GhostMe deve capire chi sei prima di
          capire come ragioni.
        </p>

        <div className="mt-10 space-y-5">
          <input
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            placeholder="Nome"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <input
            value={age}
            onChange={(e) =>
              setAge(e.target.value)
            }
            placeholder="Età"
            type="number"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <input
            value={gender}
            onChange={(e) =>
              setGender(e.target.value)
            }
            placeholder="Genere"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <input
            value={job}
            onChange={(e) =>
              setJob(e.target.value)
            }
            placeholder="Lavoro"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <input
            value={location}
            onChange={(e) =>
              setLocation(e.target.value)
            }
            placeholder="Località (es. Udine, Italia)"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <textarea
            value={hobbies}
            onChange={(e) =>
              setHobbies(e.target.value)
            }
            placeholder="Hobby"
            className="h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <textarea
            value={sports}
            onChange={(e) =>
              setSports(e.target.value)
            }
            placeholder="Sport"
            className="h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <input
            value={relationshipStatus}
            onChange={(e) =>
              setRelationshipStatus(
                e.target.value
              )
            }
            placeholder="Relazione"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <input
            value={childrenInfo}
            onChange={(e) =>
              setChildrenInfo(e.target.value)
            }
            placeholder="Figli"
            className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <textarea
            value={interests}
            onChange={(e) =>
              setInterests(e.target.value)
            }
            placeholder="Interessi"
            className="h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <textarea
            value={communicationStyle}
            onChange={(e) =>
              setCommunicationStyle(
                e.target.value
              )
            }
            placeholder="Che tipo di persona sei?"
            className="h-28 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <textarea
            value={shortBio}
            onChange={(e) =>
              setShortBio(e.target.value)
            }
            placeholder="Descriviti liberamente"
            className="h-40 w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-4 outline-none"
          />

          <button
            onClick={saveProfile}
            disabled={loading}
            className="w-full rounded-2xl bg-cyan-400 px-6 py-4 font-black text-black"
          >
            {loading
              ? "GhostMe ti sta analizzando..."
              : "Continua"}
          </button>
        </div>
      </div>
    </main>
  );
}