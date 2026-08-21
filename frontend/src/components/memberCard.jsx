export default function MemberCard({ member }) {
  return (
    <div className="table-row">
      <div className="col name">{member.name}</div>
      <div className="col">{member.department || "-"}</div>
      <div className="col">{member.year || "-"}</div>
      <div className="col position">{member.bxPosition || "Member"}</div>
    <div className="col socials">
  {member.socials?.filter(s => s.platform).map((s, i) => (
    <span key={i} className="social-tag">{s.platform}</span>
  ))}
</div>
    </div>
  );
}