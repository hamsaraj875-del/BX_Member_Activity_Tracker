import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportReportToPDF = (report) => {
  if (!report) return;

  const doc = new jsPDF();
  const title = report.title || 'BX Technical Club Analytics Report';

  // Club Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('BX TECHNICAL CLUB', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Member Activity, Coding Intelligence & Attendance Audit', 14, 26);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

  // Report Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 48);

  const summary = report.summaryData || {};

  if (report.type === 'individual' && summary.member) {
    // Individual Member Breakdown
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);

    const mem = summary.member;
    const stats = summary.stats || {};

    const memberDetails = [
      ['Name', mem.name || 'N/A', 'Role / Year', `${mem.bxRole || 'Member'} • Year ${mem.year || 1}`],
      ['Email', mem.email || 'N/A', 'Department', mem.department || 'CSE'],
      ['GitHub Commits', `${stats.githubCommits || 0}`, 'LeetCode Solved', `${stats.leetcodeSolved || 0}`],
      ['Codeforces Rating', `${stats.codeforcesRating || 'Unrated'}`, 'Attendance Rate', `${stats.attendanceRate || 0}%`],
      ['Total Verified Contributions', `${stats.totalContributions || 0}`, 'Events Attended', `${stats.eventsAttended || 0} / ${stats.totalEvents || 0}`],
    ];

    doc.autoTable({
      startY: 55,
      head: [['Field', 'Value', 'Field', 'Value']],
      body: memberDetails,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // Indigo
    });

    if (summary.recentActivities && summary.recentActivities.length > 0) {
      const actRows = summary.recentActivities.slice(0, 15).map(a => [
        new Date(a.date).toLocaleDateString(),
        a.platform?.toUpperCase(),
        a.activityType,
        a.metadata?.title || `Value: ${a.value}`,
      ]);

      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 12,
        head: [['Date', 'Platform', 'Activity', 'Details']],
        body: actRows,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });
    }
  } else if (summary.membersSummary) {
    // Club-wide table
    const tableRows = summary.membersSummary.map((m, idx) => [
      idx + 1,
      m.name,
      m.department,
      `Y${m.year}`,
      m.bxRole,
      m.githubCommits,
      m.leetcodeSolved,
      m.attendanceRate,
      m.totalContributions,
    ]);

    doc.autoTable({
      startY: 55,
      head: [['#', 'Name', 'Dept', 'Yr', 'Role', 'Commits', 'LeetCode', 'Attend %', 'Contrib']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 8 },
    });
  } else {
    // General summary key-value
    const generalData = Object.entries(summary).map(([k, v]) => [
      k,
      typeof v === 'object' ? JSON.stringify(v) : `${v}`,
    ]);

    doc.autoTable({
      startY: 55,
      head: [['Metric', 'Details']],
      body: generalData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });
  }

  // Footer note
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `BX Analytics System • Page ${i} of ${pageCount}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
};
