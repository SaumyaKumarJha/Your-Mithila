import Link from "next/link";
import { MapPin, IndianRupee, MessageCircle, BadgeCheck, Star } from "lucide-react";

// Each kind of employer gets its own pigment tile
const ORG_TYPE_CONFIG: Record<string, { icon: string; bg: string; label: string }> = {
  HOTEL:    { icon: "🏨", bg: "#FFC83D", label: "Hotel"    },
  HOSPITAL: { icon: "🏥", bg: "#FFB3AA", label: "Hospital" },
  SCHOOL:   { icon: "🏫", bg: "#C9CEFF", label: "School"   },
  SHOP:     { icon: "🏪", bg: "#B9F3CF", label: "Shop"     },
  FACTORY:  { icon: "🏭", bg: "#E7DCD6", label: "Factory"  },
  OFFICE:   { icon: "🏢", bg: "#FFD3E4", label: "Office"   },
  HOME:     { icon: "🏠", bg: "#FFE9A8", label: "Home"     },
  OTHER:    { icon: "💼", bg: "#FFD3E4", label: "Other"    },
};

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME:  "Full time",
  PART_TIME:  "Part time",
  CONTRACT:   "Contract",
  DAILY_WAGE: "Daily wage",
};

const JOB_TYPE_BG: Record<string, string> = {
  FULL_TIME:  "#C9CEFF",
  PART_TIME:  "#FFD3E4",
  CONTRACT:   "#FFE9A8",
  DAILY_WAGE: "#B9F3CF",
};

interface Props {
  job: {
    id: string;
    title: string;
    organization: string;
    orgType: string;
    jobType: string;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryUnit: string;
    locality: string;
    city: string;
    contactPhone: string;
    contactWhatsapp?: string | null;
    isVerified: boolean;
    isFeatured: boolean;
  };
}

export function JobCard({ job: j }: Props) {
  const phone = j.contactWhatsapp || j.contactPhone;
  const waMsg = `Hi, I saw the job "${j.title}" at ${j.organization} on Your Mithila. I am interested.`;
  const org = ORG_TYPE_CONFIG[j.orgType] ?? ORG_TYPE_CONFIG.OTHER;

  return (
    <article className="gz-card gz-tilt p-4 flex flex-col">
      <div className="flex items-start gap-3">
        <div className="gz-org" style={{ background: org.bg }} title={org.label}>
          <span aria-hidden="true">{org.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="gz-tag" style={{ background: JOB_TYPE_BG[j.jobType] ?? "#fff" }}>
              {JOB_TYPE_LABELS[j.jobType] ?? j.jobType.replace("_", " ")}
            </span>
            {j.isFeatured && <span className="gz-tag gz-tag-feat"><Star className="w-3 h-3 fill-current" /> Featured</span>}
          </div>
          <Link href={`/jobs/${j.id}`}>
            <h3 className="gz-card-title hover:underline decoration-2 underline-offset-2">{j.title}</h3>
          </Link>
          <p className="text-sm font-semibold mt-0.5 flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
            <span className="truncate">{j.organization}</span>
            {j.isVerified && (
              <span style={{ color: "var(--info)" }} title="Verified employer">
                <BadgeCheck className="w-4 h-4" /><span className="sr-only">Verified</span>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        <span className="gz-mini"><MapPin className="w-3.5 h-3.5" />{j.locality}</span>
        {j.salaryMin ? (
          <span className="gz-mini" style={{ color: "var(--success)", borderColor: "currentColor" }}>
            <IndianRupee className="w-3 h-3" />
            {j.salaryMin.toLocaleString("en-IN")}
            {j.salaryMax ? `–${j.salaryMax.toLocaleString("en-IN")}` : "+"}
            /{j.salaryUnit === "DAILY" ? "day" : "mo"}
          </span>
        ) : null}
      </div>

      <div className="flex gap-2 mt-auto pt-4">
        <Link href={`/jobs/${j.id}`} className="gz-btn-sm gz-btn-ghost">Details</Link>
        <a
          href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gz-btn-sm gz-btn-wa"
        >
          <MessageCircle className="w-4 h-4" /> Apply
        </a>
      </div>
    </article>
  );
}
