import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Briefcase, 
  Wrench, 
  Globe, 
  History, 
  GraduationCap, 
  FileText, 
  Upload, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft,
  Plus,
  Trash2,
  Download,
  Send,
  AlertCircle,
  Mail,
  MessageCircle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Experience {
  id: string;
  company: string;
  job: string;
  start: string;
  end: string;
  country: string;
  tasks: string;
}

interface Education {
  id: string;
  degree: string;
  school: string;
  year: string;
}

interface Certificate {
  id: string;
  name: string;
  year: string;
}

const CandidateForm = () => {
  const { t, lang } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    personal: {
      firstName: '',
      lastName: '',
      dob: '',
      nationality: '',
      phone: '',
      email: '',
      address: '',
      zip: '',
      city: '',
      country: ''
    },
    professional: {
      jobTitle: '',
      desiredJob: '',
      yearsExp: '',
      specialization: '',
      summary: '',
      availableFrom: '',
      workType: 'Fulltime',
      region: ''
    },
    skills: {
      ramen: false,
      deuren: false,
      kunststof: false,
      aluminium: false,
      hout: false,
      hst: false,
      dakramen: false,
      afwerking: false,
      gevel: false,
      renovatie: false,
      nieuwbouw: false,
      other: ''
    },
    dutchWork: {
      license: false,
      transport: false,
      car: false,
      bsn: '',
      iban: '',
      vca: false,
      zzp: false,
      btw: '',
      kvk: '',
      permit: false,
      nlWide: false,
      overtime: false,
      shifts: false
    },
    languages: {
      nl: 'basis',
      en: 'basis',
      pl: 'basis',
      de: 'basis',
      other: ''
    },
    experience: [] as Experience[],
    education: [] as Education[],
    certificates: [] as Certificate[],
    extra: {
      motivation: '',
      salary: '',
      remarks: ''
    },
    consent: {
      data: false,
      correct: false,
      send: false
    }
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    photo: null
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personal: { ...prev.personal, [name]: value }
    }));
  };

  const handleProfessionalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      professional: { ...prev.professional, [name]: value }
    }));
  };

  const handleSkillChange = (skill: keyof typeof formData.skills) => {
    setFormData(prev => ({
      ...prev,
      skills: { ...prev.skills, [skill]: !prev.skills[skill] }
    }));
  };

  const handleDutchWorkChange = (field: keyof typeof formData.dutchWork, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      dutchWork: { ...prev.dutchWork, [field]: value }
    }));
  };

  const handleLanguageChange = (lang: keyof typeof formData.languages, level: string) => {
    setFormData(prev => ({
      ...prev,
      languages: { ...prev.languages, [lang]: level }
    }));
  };
  
  const handleExtraChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      extra: { ...prev.extra, [name]: value }
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: Math.random().toString(36).substring(2, 11),
      company: '',
      job: '',
      start: '',
      end: '',
      country: '',
      tasks: ''
    };
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Math.random().toString(36).substring(2, 11),
      degree: '',
      school: '',
      year: ''
    };
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addCertificate = () => {
    const newCert: Certificate = {
      id: Math.random().toString(36).substring(2, 11),
      name: '',
      year: ''
    };
    setFormData(prev => ({
      ...prev,
      certificates: [...prev.certificates, newCert]
    }));
  };

  const updateCertificate = (id: string, field: keyof Certificate, value: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.map(cert => cert.id === id ? { ...cert, [field]: value } : cert)
    }));
  };

  const removeCertificate = (id: string) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(cert => cert.id !== id)
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generatePDF = async (download = true) => {
    const doc = new jsPDF();
    const primaryColor = [20, 30, 50]; // Deep Navy
    const accentColor = [180, 150, 50]; // Muted Gold
    const textColor = [40, 40, 40];
    const lightTextColor = [100, 100, 100];
    const sidebarColor = [245, 245, 245]; // Very Light Gray
    
    // Background for sidebar
    doc.setFillColor(sidebarColor[0], sidebarColor[1], sidebarColor[2]);
    doc.rect(0, 0, 75, 297, 'F');
    
    // Vertical separator line
    doc.setDrawColor(220, 220, 220);
    doc.line(75, 0, 75, 297);

    // Logo removed — clean CV layout
    
    let leftY = 20;
    const leftX = 10;
    const leftWidth = 55;
    
    // Profile Photo
    if (files.photo) {
      try {
        const imgData = await fileToDataURL(files.photo);
        // Let jsPDF auto-detect format from the data URL — works reliably for JPEG, PNG, etc.
        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(1);
        doc.rect(17, leftY - 1, 42, 42); // Border
        doc.addImage(imgData, 18, leftY, 40, 40);
        leftY += 55;
      } catch (e) {
        console.error('Error adding photo to PDF:', e);
        // Show placeholder on error
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(18, leftY, 40, 40);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('PHOTO ERROR', 38, leftY + 22, { align: 'center' });
        leftY += 55;
      }
    } else {
      // Placeholder for photo
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(18, leftY, 40, 40);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('NO PHOTO', 38, leftY + 22, { align: 'center' });
      leftY += 55;
    }
    
    // Sidebar: Personal Details
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.candidate.personal.toUpperCase(), leftX, leftY);
    leftY += 6;
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setLineWidth(0.5);
    doc.line(leftX, leftY, leftX + 20, leftY);
    leftY += 8;
    
    doc.setFontSize(9);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    
    const personalItems = [
      { label: t.candidate.email, value: formData.personal.email },
      { label: t.candidate.phone, value: formData.personal.phone },
      { label: t.candidate.address, value: `${formData.personal.address}, ${formData.personal.city}` },
      { label: t.candidate.dob, value: formData.personal.dob },
      { label: t.candidate.nationality, value: formData.personal.nationality }
    ];
    
    personalItems.forEach(item => {
      if (item.value) {
        doc.setFont('helvetica', 'bold');
        doc.text(item.label + ':', leftX, leftY);
        leftY += 4;
        doc.setFont('helvetica', 'normal');
        const splitVal = doc.splitTextToSize(item.value, leftWidth);
        doc.text(splitVal, leftX, leftY);
        leftY += (splitVal.length * 4) + 4;
      }
    });
    
    leftY += 5;
    
    // Sidebar: Skills
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.candidate.skills.toUpperCase(), leftX, leftY);
    leftY += 6;
    doc.line(leftX, leftY, leftX + 20, leftY);
    leftY += 8;
    
    const activeSkills = Object.entries(formData.skills)
      .filter(([key, val]) => val === true && key !== 'other')
      .map(([key]) => (t.candidate.skillsList as Record<string, string>)[key]);
    
    if (formData.skills.other) activeSkills.push(formData.skills.other);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    activeSkills.forEach(skill => {
      doc.text('• ' + skill, leftX, leftY);
      leftY += 5;
    });
    
    leftY += 10;
    
    // Sidebar: Languages
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(t.candidate.languages.toUpperCase(), leftX, leftY);
    leftY += 6;
    doc.line(leftX, leftY, leftX + 20, leftY);
    leftY += 8;
    
    const langNames: Record<string, Record<string, string>> = {
      nl: { NL: 'Nederlands', EN: 'Dutch', PL: 'Holenderski', DE: 'Niederländisch', TR: 'Hollandaca' },
      en: { NL: 'Engels', EN: 'English', PL: 'Angielski', DE: 'Englisch', TR: 'İngilizce' },
      pl: { NL: 'Pools', EN: 'Polish', PL: 'Polski', DE: 'Polnisch', TR: 'Lehçe' },
      de: { NL: 'Duits', EN: 'German', PL: 'Niemiecki', DE: 'Deutsch', TR: 'Almanca' }
    };

    const languages = [
      { name: langNames.nl[lang] || 'Nederlands', level: formData.languages.nl },
      { name: langNames.en[lang] || 'English', level: formData.languages.en },
      { name: langNames.pl[lang] || 'Polski', level: formData.languages.pl },
      { name: langNames.de[lang] || 'Deutsch', level: formData.languages.de }
    ];
    
    languages.forEach(langItem => {
      if (leftY > 280) return; // prevent sidebar overflow
      doc.setFont('helvetica', 'bold');
      doc.text(langItem.name + ':', leftX, leftY);
      doc.setFont('helvetica', 'normal');
      doc.text((t.candidate.langLevels as Record<string, string>)[langItem.level] || langItem.level, leftX + 25, leftY);
      leftY += 5;
    });

    // Other language
    if (formData.languages.other) {
      doc.setFont('helvetica', 'bold');
      doc.text(formData.languages.other, leftX, leftY);
      leftY += 5;
    }

    // Sidebar: Attached Documents
    const attachedFiles = Object.entries(files).filter(([, f]) => f !== null);
    if (attachedFiles.length > 0 && leftY < 265) {
      leftY += 10;
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text((t.candidate.pdfAttachments || 'ATTACHMENTS').toUpperCase(), leftX, leftY);
      leftY += 6;
      doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.line(leftX, leftY, leftX + 20, leftY);
      leftY += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      attachedFiles.forEach(([key, file]) => {
        if (leftY > 285) return;
        const label = (t.candidate.uploadFields as Record<string, string>)[key] || key;
        doc.text('✓ ' + label, leftX, leftY);
        leftY += 4;
      });
    }
    
    // ===== MAIN CONTENT (right column) =====
    const mainX = 85;
    const mainWidth = 110;
    let rightY = 30;

    // Helper for page breaks on right column
    const checkPageBreak = (needed: number) => {
      if (rightY + needed > 275) {
        doc.addPage();
        rightY = 20;
      }
    };
    
    // Name
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    const fullName = `${formData.personal.firstName} ${formData.personal.lastName}`.toUpperCase();
    const nameLines = doc.splitTextToSize(fullName, mainWidth);
    doc.text(nameLines, mainX, rightY);
    rightY += nameLines.length * 10 + 2;
    
    // Job Title
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    const jobTitleText = formData.professional.jobTitle || (t.candidate.pdfCandidateLabel || 'CANDIDATE');
    const jobTitleLines = doc.splitTextToSize(jobTitleText, mainWidth);
    doc.text(jobTitleLines, mainX, rightY);
    rightY += jobTitleLines.length * 7 + 5;

    // Professional quick info
    const profInfo: string[] = [];
    if (formData.professional.yearsExp) profInfo.push(`${t.candidate.yearsExp}: ${formData.professional.yearsExp}`);
    if (formData.professional.desiredJob) profInfo.push(`${t.candidate.desiredJob}: ${formData.professional.desiredJob}`);
    if (formData.professional.availableFrom) profInfo.push(`${t.candidate.availableFrom}: ${formData.professional.availableFrom}`);
    if (formData.professional.specialization) profInfo.push(`${t.candidate.pdfSpecialization || 'Specialization'}: ${formData.professional.specialization}`);
    if (formData.professional.workType && formData.professional.workType !== 'Fulltime') profInfo.push(`${t.candidate.pdfWorkType || 'Employment Type'}: ${formData.professional.workType}`);
    if (formData.professional.region) profInfo.push(`${t.candidate.pdfRegion || 'Region'}: ${formData.professional.region}`);

    if (profInfo.length > 0) {
      doc.setFontSize(9);
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.setFont('helvetica', 'normal');
      profInfo.forEach(info => {
        const infoLines = doc.splitTextToSize(info, mainWidth);
        doc.text(infoLines, mainX, rightY);
        rightY += infoLines.length * 4 + 1;
      });
      rightY += 5;
    }
    
    // Summary
    if (formData.professional.summary) {
      checkPageBreak(30);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.candidate.summary.toUpperCase(), mainX, rightY);
      rightY += 8;
      
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const splitSummary = doc.splitTextToSize(formData.professional.summary, mainWidth);
      doc.text(splitSummary, mainX, rightY);
      rightY += (splitSummary.length * 5) + 10;
    }
    
    // Experience
    if (formData.experience.length > 0) {
      checkPageBreak(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.candidate.experience.toUpperCase(), mainX, rightY);
      rightY += 8;
      
      formData.experience.forEach(exp => {
        checkPageBreak(30);
        
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        const jobLines = doc.splitTextToSize(exp.job || '-', mainWidth);
        doc.text(jobLines, mainX, rightY);
        rightY += jobLines.length * 5;
        
        doc.setFontSize(9);
        doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
        const expMeta = [exp.start, exp.end].filter(Boolean).join(' - ');
        const expLocation = [exp.company, exp.country].filter(Boolean).join(', ');
        const metaText = `${expMeta}  |  ${expLocation}`;
        const metaLines = doc.splitTextToSize(metaText, mainWidth);
        doc.text(metaLines, mainX, rightY);
        rightY += metaLines.length * 4 + 3;
        
        if (exp.tasks) {
          doc.setTextColor(textColor[0], textColor[1], textColor[2]);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const tasks = doc.splitTextToSize(exp.tasks, mainWidth);
          doc.text(tasks, mainX, rightY);
          rightY += (tasks.length * 5) + 8;
        } else {
          rightY += 5;
        }
      });
      rightY += 5;
    }
    
    // Education
    if (formData.education.length > 0) {
      checkPageBreak(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.candidate.education.toUpperCase(), mainX, rightY);
      rightY += 8;
      
      formData.education.forEach(edu => {
        checkPageBreak(15);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.degree || '-', mainX, rightY);
        doc.setFontSize(9);
        doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
        doc.text(`${edu.school}  |  ${edu.year}`, mainX, rightY + 5);
        rightY += 12;
      });
      rightY += 5;
    }

    // Certificates
    if (formData.certificates.length > 0) {
      checkPageBreak(20);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text((t.candidate.certFields?.title || t.candidate.education).toUpperCase(), mainX, rightY);
      rightY += 8;

      formData.certificates.forEach(cert => {
        checkPageBreak(10);
        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`• ${cert.name}  (${cert.year})`, mainX, rightY);
        rightY += 6;
      });
      rightY += 5;
    }
    
    // Dutch Work Info
    checkPageBreak(40);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(t.candidate.dutchWork.toUpperCase(), mainX, rightY);
    rightY += 8;

    const yesLabel = t.candidate.pdfYes || 'Yes';
    const noLabel = t.candidate.pdfNo || 'No';
    
    const dutchInfo = [
      [t.candidate.dutchWorkList.license, formData.dutchWork.license ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.transport, formData.dutchWork.transport ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.car, formData.dutchWork.car ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.vca, formData.dutchWork.vca ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.zzp, formData.dutchWork.zzp ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.permit, formData.dutchWork.permit ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.nlWide, formData.dutchWork.nlWide ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.overtime, formData.dutchWork.overtime ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.shifts, formData.dutchWork.shifts ? yesLabel : noLabel],
      [t.candidate.dutchWorkList.bsn, formData.dutchWork.bsn || '-'],
      [t.candidate.dutchWorkList.iban || 'IBAN', formData.dutchWork.iban || '-'],
      [t.candidate.dutchWorkList.btw, formData.dutchWork.btw || '-'],
      [t.candidate.dutchWorkList.kvk, formData.dutchWork.kvk || '-']
    ];
    
    autoTable(doc, {
      startY: rightY,
      margin: { left: mainX },
      tableWidth: mainWidth,
      body: dutchInfo,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 70 }, 1: { cellWidth: 30 } }
    });

    rightY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ? (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10 : rightY + 60;

    // Motivation / Extra
    const hasExtra = formData.extra.motivation || formData.extra.salary || formData.extra.remarks;
    if (hasExtra) {
      checkPageBreak(30);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(t.candidate.extra.toUpperCase(), mainX, rightY);
      rightY += 8;

      doc.setFontSize(10);
      doc.setTextColor(textColor[0], textColor[1], textColor[2]);

      if (formData.extra.motivation) {
        doc.setFont('helvetica', 'bold');
        doc.text(t.candidate.extraFields.motivation + ':', mainX, rightY);
        rightY += 5;
        doc.setFont('helvetica', 'normal');
        const motLines = doc.splitTextToSize(formData.extra.motivation, mainWidth);
        doc.text(motLines, mainX, rightY);
        rightY += motLines.length * 5 + 5;
      }
      if (formData.extra.salary) {
        doc.setFont('helvetica', 'bold');
        doc.text(t.candidate.extraFields.salary + ':', mainX, rightY);
        doc.setFont('helvetica', 'normal');
        doc.text(formData.extra.salary, mainX + 40, rightY);
        rightY += 6;
      }
      if (formData.extra.remarks) {
        doc.setFont('helvetica', 'bold');
        doc.text(t.candidate.extraFields.remarks + ':', mainX, rightY);
        rightY += 5;
        doc.setFont('helvetica', 'normal');
        const remLines = doc.splitTextToSize(formData.extra.remarks, mainWidth);
        doc.text(remLines, mainX, rightY);
        rightY += remLines.length * 5 + 5;
      }
    }

    if (download) {
      doc.save(`CV_${formData.personal.firstName}_${formData.personal.lastName}.pdf`);
    }
    
    return doc.output('datauristring');
  };

  const buildSummaryText = () => {
    const p = formData.personal;
    const pr = formData.professional;
    const activeSkills = Object.entries(formData.skills)
      .filter(([key, val]) => val === true && key !== 'other')
      .map(([key]) => (t.candidate.skillsList as Record<string, string>)[key])
      .join(', ');
    const skillsOther = formData.skills.other ? `, ${formData.skills.other}` : '';
    
    let text = `--- ${t.candidate.personal} ---\n`;
    text += `${t.candidate.firstName}: ${p.firstName}\n`;
    text += `${t.candidate.lastName}: ${p.lastName}\n`;
    text += `${t.candidate.dob}: ${p.dob}\n`;
    text += `${t.candidate.nationality}: ${p.nationality}\n`;
    text += `${t.candidate.phone}: ${p.phone}\n`;
    text += `${t.candidate.email}: ${p.email}\n`;
    text += `${t.candidate.address}: ${p.address}, ${p.zip} ${p.city}, ${p.country}\n\n`;
    
    text += `--- ${t.candidate.professional} ---\n`;
    text += `${t.candidate.jobTitle}: ${pr.jobTitle}\n`;
    text += `${t.candidate.desiredJob}: ${pr.desiredJob}\n`;
    text += `${t.candidate.yearsExp}: ${pr.yearsExp}\n`;
    text += `${t.candidate.availableFrom}: ${pr.availableFrom}\n\n`;
    
    text += `--- ${t.candidate.skills} ---\n`;
    text += `${activeSkills}${skillsOther}\n\n`;
    
    if (formData.dutchWork.bsn) text += `BSN: ${formData.dutchWork.bsn}\n`;
    if (formData.dutchWork.iban) text += `IBAN: ${formData.dutchWork.iban}\n`;
    if (formData.dutchWork.btw) text += `BTW: ${formData.dutchWork.btw}\n`;
    if (formData.dutchWork.kvk) text += `KVK: ${formData.dutchWork.kvk}\n`;
    
    return text;
  };

  const sendViaEmail = async () => {
    if (!formData.consent.data || !formData.consent.correct || !formData.consent.send) {
      setError(t.candidate.pdfConsentError || 'Please accept all conditions to continue.');
      return;
    }
    setError(null);
    
    // Generate and download PDF first
    await generatePDF(true);
    
    const subject = encodeURIComponent(`Inschrijving - ${formData.personal.firstName} ${formData.personal.lastName}`);
    const body = encodeURIComponent(buildSummaryText());
    window.open(`mailto:tomasz_jaskiewicz@hotmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  const sendViaWhatsApp = async () => {
    if (!formData.consent.data || !formData.consent.correct || !formData.consent.send) {
      setError(t.candidate.pdfConsentError || 'Please accept all conditions to continue.');
      return;
    }
    setError(null);
    
    // Generate and download PDF first
    await generatePDF(true);
    
    const text = encodeURIComponent(buildSummaryText());
    window.open(`https://wa.me/31684111366?text=${text}`, '_blank');
  };

  const steps = [
    { id: 'personal', title: t.candidate.personal, icon: User },
    { id: 'professional', title: t.candidate.professional, icon: Briefcase },
    { id: 'skills', title: t.candidate.skills, icon: Wrench },
    { id: 'experience', title: t.candidate.experience, icon: History },
    { id: 'education', title: t.candidate.education, icon: GraduationCap },
    { id: 'extra', title: t.candidate.extra, icon: FileText }
  ];

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};
    const reqMsg = t.candidate.validationRequired || 'This field is required';
    const emailMsg = t.candidate.validationEmail || 'Invalid email address';
    const phoneMsg = t.candidate.validationPhone || 'Invalid phone number';

    if (step === 0) {
      if (!formData.personal.firstName.trim()) errs.firstName = reqMsg;
      if (!formData.personal.lastName.trim()) errs.lastName = reqMsg;
      if (!formData.personal.email.trim()) errs.email = reqMsg;
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.personal.email)) errs.email = emailMsg;
      if (!formData.personal.phone.trim()) errs.phone = reqMsg;
      else if (!/^[+]?[\d\s()-]{7,}$/.test(formData.personal.phone)) errs.phone = phoneMsg;
    }
    if (step === 1) {
      if (!formData.professional.jobTitle.trim()) errs.jobTitle = reqMsg;
    }

    setStepErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };
  const prevStep = () => { setStepErrors({}); setCurrentStep(prev => Math.max(prev - 1, 0)); };

  return (
    <div className="mt-20 border-t border-zinc-800 pt-20">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t.candidate.title}</h2>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          {t.candidate.subtitle}
        </p>
      </div>

      <div className="bg-zinc-900 rounded-[3rem] border border-zinc-800 shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="bg-zinc-950 p-6 border-b border-zinc-800">
          <div className="flex justify-between items-center max-w-4xl mx-auto relative">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index <= currentStep ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-2 hidden md:block ${
                  index <= currentStep ? 'text-amber-500' : 'text-zinc-600'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
            {/* Line behind */}
            <div className="absolute left-0 right-0 h-0.5 bg-zinc-800 -z-0 mx-20 hidden md:block" />
            <div 
              className="absolute left-0 h-0.5 bg-amber-500 transition-all duration-500 -z-0 mx-20 hidden md:block" 
              style={{ width: `${(currentStep / (steps.length - 1)) * (100 - 20)}%` }}
            />
          </div>
        </div>

        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 mx-auto mb-8">
                  <CheckCircle className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">{t.candidate.success.title}</h3>
                <p className="text-zinc-400 text-lg max-w-md mx-auto mb-10">
                  {t.candidate.success.desc}
                </p>
                <button 
                  onClick={() => { setIsSuccess(false); setCurrentStep(0); setFormData({
                    personal: { firstName: '', lastName: '', dob: '', nationality: '', phone: '', email: '', address: '', zip: '', city: '', country: '' },
                    professional: { jobTitle: '', desiredJob: '', yearsExp: '', specialization: '', summary: '', availableFrom: '', workType: 'Fulltime', region: '' },
                    skills: { ramen: false, deuren: false, kunststof: false, aluminium: false, hout: false, hst: false, dakramen: false, afwerking: false, gevel: false, renovatie: false, nieuwbouw: false, other: '' },
                    dutchWork: { license: false, transport: false, car: false, bsn: '', iban: '', vca: false, zzp: false, btw: '', kvk: '', permit: false, nlWide: false, overtime: false, shifts: false },
                    languages: { nl: 'basis', en: 'basis', pl: 'basis', de: 'basis', other: '' },
                    experience: [], education: [], certificates: [],
                    extra: { motivation: '', salary: '', remarks: '' },
                    consent: { data: false, correct: false, send: false }
                  }); setFiles({ photo: null }); setPhotoPreview(null); }}
                  className="px-10 py-4 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
                >
                  {t.candidateNav.newRegistration}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Step Content */}
                {currentStep === 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.firstName} *</label>
                      <input type="text" name="firstName" value={formData.personal.firstName} onChange={handlePersonalChange} className={`w-full px-6 py-4 bg-zinc-950 border ${stepErrors.firstName ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`} />
                      {stepErrors.firstName && <p className="text-red-500 text-xs ml-1">{stepErrors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.lastName} *</label>
                      <input type="text" name="lastName" value={formData.personal.lastName} onChange={handlePersonalChange} className={`w-full px-6 py-4 bg-zinc-950 border ${stepErrors.lastName ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`} />
                      {stepErrors.lastName && <p className="text-red-500 text-xs ml-1">{stepErrors.lastName}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.dob}</label>
                      <input type="date" name="dob" value={formData.personal.dob} onChange={handlePersonalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.nationality}</label>
                      <input type="text" name="nationality" value={formData.personal.nationality} onChange={handlePersonalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.phone} *</label>
                      <input type="tel" name="phone" value={formData.personal.phone} onChange={handlePersonalChange} className={`w-full px-6 py-4 bg-zinc-950 border ${stepErrors.phone ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`} />
                      {stepErrors.phone && <p className="text-red-500 text-xs ml-1">{stepErrors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.email} *</label>
                      <input type="email" name="email" value={formData.personal.email} onChange={handlePersonalChange} className={`w-full px-6 py-4 bg-zinc-950 border ${stepErrors.email ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`} />
                      {stepErrors.email && <p className="text-red-500 text-xs ml-1">{stepErrors.email}</p>}
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.address}</label>
                      <input type="text" name="address" value={formData.personal.address} onChange={handlePersonalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.zip}</label>
                      <input type="text" name="zip" value={formData.personal.zip} onChange={handlePersonalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.city}</label>
                      <input type="text" name="city" value={formData.personal.city} onChange={handlePersonalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.pdfCountry || 'Country'}</label>
                      <input type="text" name="country" value={formData.personal.country} onChange={handlePersonalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.jobTitle} *</label>
                        <input type="text" name="jobTitle" value={formData.professional.jobTitle} onChange={handleProfessionalChange} className={`w-full px-6 py-4 bg-zinc-950 border ${stepErrors.jobTitle ? 'border-red-500' : 'border-zinc-800'} rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors`} />
                        {stepErrors.jobTitle && <p className="text-red-500 text-xs ml-1">{stepErrors.jobTitle}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.desiredJob}</label>
                        <input type="text" name="desiredJob" value={formData.professional.desiredJob} onChange={handleProfessionalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.yearsExp}</label>
                        <input type="number" name="yearsExp" value={formData.professional.yearsExp} onChange={handleProfessionalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.availableFrom}</label>
                        <input type="date" name="availableFrom" value={formData.professional.availableFrom} onChange={handleProfessionalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.pdfSpecialization || 'Specialization'}</label>
                      <input type="text" name="specialization" value={formData.professional.specialization} onChange={handleProfessionalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.pdfRegion || 'Region'}</label>
                      <input type="text" name="region" value={formData.professional.region} onChange={handleProfessionalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.pdfWorkType || 'Employment Type'}</label>
                      <select name="workType" value={formData.professional.workType} onChange={handleProfessionalChange} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors">
                        <option value="Fulltime">{t.candidate.workTypeOptions?.fulltime || 'Fulltime'}</option>
                        <option value="Parttime">{t.candidate.workTypeOptions?.parttime || 'Parttime'}</option>
                        <option value="Freelance/ZZP">{t.candidate.workTypeOptions?.freelance || 'Freelance / ZZP'}</option>
                        <option value="Uitzend">{t.candidate.workTypeOptions?.uitzend || 'Uitzend / Tijdelijk'}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.summary}</label>
                      <textarea name="summary" value={formData.professional.summary} onChange={handleProfessionalChange} rows={4} className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-white font-bold mb-6 flex items-center space-x-2">
                        <Wrench className="w-5 h-5 text-amber-500" />
                        <span>{t.candidate.skills}</span>
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(t.candidate.skillsList).map(([key, label]) => (
                          key !== 'other' && (
                            <button
                              key={key}
                              type="button"
                              onClick={() => handleSkillChange(key as keyof typeof formData.skills)}
                              className={`p-4 rounded-xl border text-sm font-medium transition-all text-left ${
                                formData.skills[key as keyof typeof formData.skills] 
                                  ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/20' 
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                              }`}
                            >
                              {label as string}
                            </button>
                          )
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-bold mb-6 flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        <span>{t.candidate.dutchWork}</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'license', label: t.candidate.dutchWorkList.license },
                            { key: 'transport', label: t.candidate.dutchWorkList.transport },
                            { key: 'car', label: t.candidate.dutchWorkList.car },
                            { key: 'vca', label: t.candidate.dutchWorkList.vca },
                            { key: 'zzp', label: t.candidate.dutchWorkList.zzp },
                            { key: 'permit', label: t.candidate.dutchWorkList.permit },
                            { key: 'nlWide', label: t.candidate.dutchWorkList.nlWide },
                            { key: 'overtime', label: t.candidate.dutchWorkList.overtime },
                            { key: 'shifts', label: t.candidate.dutchWorkList.shifts },
                          ].map(item => (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => handleDutchWorkChange(item.key as keyof typeof formData.dutchWork, !formData.dutchWork[item.key as keyof typeof formData.dutchWork])}
                              className={`p-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all text-center ${
                                formData.dutchWork[item.key as keyof typeof formData.dutchWork] 
                                  ? 'bg-amber-500 border-amber-500 text-black' 
                                  : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                              }`}
                            >
                              {item.label as string}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-zinc-400 text-xs font-medium ml-1">{t.candidate.dutchWorkList.bsn}</label>
                            <input type="text" value={formData.dutchWork.bsn} onChange={(e) => handleDutchWorkChange('bsn', e.target.value)} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-zinc-400 text-xs font-medium ml-1">{t.candidate.dutchWorkList.iban || 'IBAN nummer'}</label>
                            <input type="text" value={formData.dutchWork.iban} onChange={(e) => handleDutchWorkChange('iban', e.target.value)} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-zinc-400 text-xs font-medium ml-1">{t.candidate.dutchWorkList.btw}</label>
                            <input type="text" value={formData.dutchWork.btw} onChange={(e) => handleDutchWorkChange('btw', e.target.value)} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-zinc-400 text-xs font-medium ml-1">{t.candidate.dutchWorkList.kvk}</label>
                            <input type="text" value={formData.dutchWork.kvk} onChange={(e) => handleDutchWorkChange('kvk', e.target.value)} className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-bold mb-6 flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-amber-500" />
                        <span>{t.candidate.languages}</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {['nl', 'en', 'pl', 'de'].map(lang => (
                          <div key={lang} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <span className="text-white font-medium uppercase">{lang}</span>
                            <div className="flex space-x-2">
                              {['basis', 'redelijk', 'goed', 'vloeiend'].map(level => (
                                <button
                                  key={level}
                                  onClick={() => handleLanguageChange(lang as keyof typeof formData.languages, level)}
                                  className={`px-3 py-1 rounded-lg text-[10px] uppercase font-bold transition-all ${
                                    formData.languages[lang as keyof typeof formData.languages] === level
                                      ? 'bg-amber-500 text-black'
                                      : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                                  }`}
                                >
                                  {(t.candidate.langLevels as Record<string, string>)[level]}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-10">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-white font-bold flex items-center space-x-2">
                          <History className="w-5 h-5 text-amber-500" />
                          <span>{t.candidate.experience}</span>
                        </h4>
                        <button onClick={addExperience} className="flex items-center space-x-2 text-amber-500 hover:text-amber-400 font-bold text-sm">
                          <Plus className="w-4 h-4" />
                          <span>{t.candidate.expFields.add}</span>
                        </button>
                      </div>
                      <div className="space-y-6">
                        {formData.experience.map((exp, index) => (
                          <div key={exp.id} className="p-6 bg-zinc-950 border border-zinc-800 rounded-2xl relative">
                            <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input placeholder={t.candidate.expFields.company} value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                              <input placeholder={t.candidate.expFields.job} value={exp.job} onChange={(e) => updateExperience(exp.id, 'job', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                              <input type="date" placeholder={t.candidate.expFields.start} value={exp.start} onChange={(e) => updateExperience(exp.id, 'start', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                              <input type="date" placeholder={t.candidate.expFields.end} value={exp.end} onChange={(e) => updateExperience(exp.id, 'end', e.target.value)} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                              <input placeholder={t.candidate.expFields.country || 'Country'} value={exp.country} onChange={(e) => updateExperience(exp.id, 'country', e.target.value)} className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                              <textarea placeholder={t.candidate.expFields.tasks} value={exp.tasks} onChange={(e) => updateExperience(exp.id, 'tasks', e.target.value)} className="md:col-span-2 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm h-24 resize-none" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-10">
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-white font-bold flex items-center space-x-2">
                          <GraduationCap className="w-5 h-5 text-amber-500" />
                          <span>{t.candidate.education}</span>
                        </h4>
                        <button onClick={addEducation} className="flex items-center space-x-2 text-amber-500 hover:text-amber-400 font-bold text-sm">
                          <Plus className="w-4 h-4" />
                          <span>{t.candidate.eduFields.addEdu}</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.education.map(edu => (
                          <div key={edu.id} className="flex items-center space-x-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <input placeholder={t.candidate.eduFields.degree} value={edu.degree} onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                            <input placeholder={t.candidate.eduFields.school} value={edu.school} onChange={(e) => updateEducation(edu.id, 'school', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                            <input placeholder={t.candidate.eduFields.year} value={edu.year} onChange={(e) => updateEducation(edu.id, 'year', e.target.value)} className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                            <button onClick={() => removeEducation(edu.id)} className="text-zinc-600 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Certificates */}
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-white font-bold flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-amber-500" />
                          <span>{t.candidate.certFields?.title || 'Certificaten'}</span>
                        </h4>
                        <button onClick={addCertificate} className="flex items-center space-x-2 text-amber-500 hover:text-amber-400 font-bold text-sm">
                          <Plus className="w-4 h-4" />
                          <span>{t.candidate.certFields?.addCert || 'Certificaat toevoegen'}</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {formData.certificates.map(cert => (
                          <div key={cert.id} className="flex items-center space-x-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                            <input placeholder={t.candidate.certFields?.name || 'Certificate name'} value={cert.name} onChange={(e) => updateCertificate(cert.id, 'name', e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                            <input placeholder={t.candidate.certFields?.year || 'Year'} value={cert.year} onChange={(e) => updateCertificate(cert.id, 'year', e.target.value)} className="w-24 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white text-sm" />
                            <button onClick={() => removeCertificate(cert.id)} className="text-zinc-600 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-bold mb-6 flex items-center space-x-2">
                        <Upload className="w-5 h-5 text-amber-500" />
                        <span>{(t.candidate.uploadFields as Record<string, string>).photo}</span>
                      </h4>
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-zinc-700 hover:border-amber-500 transition-colors group">
                          {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-500">
                              <User className="w-12 h-12 mb-2" />
                              <span className="text-xs">{t.candidate.pdfChooseFile || 'Kies bestand...'}</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              handleFileChange(e, 'photo');
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => setPhotoPreview(reader.result as string);
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                        </div>
                        <p className="text-zinc-500 text-sm">{files.photo ? files.photo.name : (t.candidate.pdfChooseFile || 'Kies bestand...')}</p>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 5 && (
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-white font-bold flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-amber-500" />
                        <span>{t.candidate.extra}</span>
                      </h4>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.extraFields.motivation}</label>
                          <textarea 
                            name="motivation" 
                            value={formData.extra.motivation} 
                            onChange={handleExtraChange} 
                            rows={3} 
                            className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.extraFields.salary}</label>
                          <input 
                            type="text" 
                            name="salary" 
                            value={formData.extra.salary} 
                            onChange={handleExtraChange} 
                            className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-zinc-400 text-sm font-medium ml-1">{t.candidate.extraFields.remarks}</label>
                          <textarea 
                            name="remarks" 
                            value={formData.extra.remarks} 
                            onChange={handleExtraChange} 
                            rows={2} 
                            className="w-full px-6 py-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-white font-bold flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-amber-500" />
                        <span>{t.candidate.consent}</span>
                      </h4>
                      <div className="space-y-4">
                        {Object.entries(t.candidate.consentFields).map(([key, label]) => (
                          <label key={key} className="flex items-start space-x-4 cursor-pointer group">
                            <div className="relative flex items-center mt-1">
                              <input 
                                type="checkbox" 
                                checked={formData.consent[key as keyof typeof formData.consent]}
                                onChange={() => setFormData(prev => ({ ...prev, consent: { ...prev.consent, [key]: !prev.consent[key as keyof typeof prev.consent] } }))}
                                className="w-5 h-5 bg-zinc-950 border border-zinc-800 rounded focus:ring-amber-500 text-amber-500" 
                              />
                            </div>
                            <span className="text-zinc-400 text-sm group-hover:text-white transition-colors">{label as string}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-500 text-sm">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                      </div>
                    )}

                    {/* Required Documents Info */}
                    <div className="p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-4">
                      <h4 className="text-amber-500 font-bold text-lg flex items-center space-x-2">
                        <FileText className="w-5 h-5" />
                        <span>{t.candidate.requiredDocsTitle || 'VEREISTE DOCUMENTEN'}</span>
                      </h4>
                      <p className="text-zinc-400 text-sm italic">
                        {t.candidate.requiredDocsSubtitle || 'Stuur een kopie van de volgende documenten per e-mail of WhatsApp:'}
                      </p>
                      <ul className="space-y-2">
                        {(t.candidate.requiredDocsList as string[] || [
                          'ID (paspoort of ID kaart)',
                          'Rijbewijs',
                          'Uittreksel KVK (recent)',
                          'VCA certificaat',
                          'Polis bedrijfsaansprakelijkheidsverzekering',
                          'Polis of kopie pasje ziektekosten verzekering',
                          'Getekende overeenkomst van Opdracht'
                        ]).map((docItem: string, i: number) => (
                          <li key={i} className="flex items-center space-x-3 text-zinc-300 text-sm">
                            <div className="w-5 h-5 rounded border border-zinc-600 flex-shrink-0" />
                            <span>{docItem}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4 p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl space-y-2">
                        <p className="text-amber-500 font-bold text-sm">{t.candidate.requiredDocsContact || 'Stuur documenten naar:'}</p>
                        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-1 sm:space-y-0">
                          <a href="mailto:tomasz_jaskiewicz@hotmail.com" className="text-zinc-300 text-sm hover:text-amber-500 transition-colors flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>tomasz_jaskiewicz@hotmail.com</span>
                          </a>
                          <a href="https://wa.me/31684111366" target="_blank" rel="noopener noreferrer" className="text-zinc-300 text-sm hover:text-green-500 transition-colors flex items-center space-x-2">
                            <MessageCircle className="w-4 h-4" />
                            <span>+31 6 84111366</span>
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 pt-6">
                      <button 
                        type="button"
                        onClick={async () => await generatePDF()}
                        className="flex-1 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all flex items-center justify-center space-x-2"
                      >
                        <Download className="w-5 h-5" />
                        <span>{t.candidate.actions.download}</span>
                      </button>
                      <button 
                        type="button"
                        onClick={sendViaEmail}
                        className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2"
                      >
                        <Mail className="w-5 h-5" />
                        <span>{t.candidate.actions.sendEmail || 'Verstuur via E-mail'}</span>
                      </button>
                      <button 
                        type="button"
                        onClick={sendViaWhatsApp}
                        className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-xl shadow-green-600/20 flex items-center justify-center space-x-2"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span>{t.candidate.actions.sendWhatsApp || 'Verstuur via WhatsApp'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                {!isSuccess && (
                  <div className="mt-12 flex justify-between items-center border-t border-zinc-800 pt-8">
                    <button 
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={`flex items-center space-x-2 text-zinc-500 hover:text-white transition-colors disabled:opacity-0`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="font-bold uppercase tracking-widest text-xs">{t.candidateNav.prev}</span>
                    </button>
                    
                    {currentStep < steps.length - 1 && (
                      <button 
                        onClick={nextStep}
                        className="flex items-center space-x-2 px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all"
                      >
                        <span className="uppercase tracking-widest text-xs">{t.candidateNav.next}</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CandidateForm;
