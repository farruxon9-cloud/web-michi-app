import pdfMake from 'pdfmake/build/pdfmake';
import { toJapaneseEra, calculateAge, toJapaneseEraYear } from './japaneseEra';

const FONT_URL = '/SawarabiGothic-Regular.ttf';

// Convert ArrayBuffer to Base64 (needed for pdfMake in-browser vfs)
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Lazy load font and initialize pdfMake
export async function initFonts(onProgress) {
  if (pdfMake.vfs && pdfMake.vfs['SawarabiGothic-Regular.ttf']) {
    return true;
  }

  if (onProgress) onProgress('loading_font');

  try {
    const response = await fetch(FONT_URL);
    if (!response.ok) throw new Error('Failed to fetch Japanese font file.');
    const buffer = await response.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);

    pdfMake.vfs = pdfMake.vfs || {};
    pdfMake.vfs['SawarabiGothic-Regular.ttf'] = base64;

    pdfMake.fonts = {
      SawarabiGothic: {
        normal: 'SawarabiGothic-Regular.ttf',
        bold: 'SawarabiGothic-Regular.ttf'
      }
    };
    return true;
  } catch (err) {
    console.error('Error loading Japanese font:', err);
    throw err;
  }
}

// Convert image URL to base64 for PDF rendering
async function urlToBase64(url) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to convert image to base64:', e);
    return null;
  }
}

/**
 * Main function to generate and download/preview standard Japanese Rirekisho PDF
 */
export async function generateRirekisho(profileData, options = {}) {
  const { onProgress, download = true } = options;

  // Initialize fonts first
  await initFonts(onProgress);

  if (onProgress) onProgress('generating_pdf');

  // Convert profile avatar to base64 if it exists
  let avatarBase64 = null;
  if (profileData.avatar) {
    avatarBase64 = await urlToBase64(profileData.avatar);
  }

  // Current Date in Japanese Era
  const todayStr = new Date().toISOString().split('T')[0];
  const eraToday = toJapaneseEra(todayStr).replace(/\d+日/, '日 現在'); // Format as "令和8年6月4日 現在"

  // Age calculation
  const age = calculateAge(profileData.birthDate);
  const eraBirthDate = toJapaneseEra(profileData.birthDate);

  // Address and contacts
  const primaryAddress = profileData.addressHistory && profileData.addressHistory.length > 0 
    ? profileData.addressHistory.find(a => a.isCurrent)?.address || profileData.addressHistory[0].address
    : profileData.address || '';
  
  const postalCode = profileData.postalCode || '';
  const phone = profileData.phone || '';
  const email = profileData.email || '';
  const genderText = profileData.gender === 'female' ? '女' : (profileData.gender === 'male' ? '男' : '');

  // Nationality and Birth Place dynamically added to Personal Requests
  let personalRequestsText = profileData.personalRequests || '貴社規定に従います。';
  if (profileData.nationality || profileData.birthPlace) {
    let extraInfo = '';
    if (profileData.nationality) {
      extraInfo += `【国籍】 ${profileData.nationality}\n`;
    }
    if (profileData.birthPlace) {
      extraInfo += `【出生地】 ${profileData.birthPlace}\n`;
    }
    personalRequestsText = `${extraInfo}${personalRequestsText}`;
  }

  // Setup Education & Work rows (max 10 rows for page 1/2 balance)
  const eduWorkRows = [];
  
  // 1. Education
  if (profileData.educationHistory && profileData.educationHistory.length > 0) {
    eduWorkRows.push({ year: '', month: '', detail: '学　　歴', align: 'center' });
    profileData.educationHistory.forEach(edu => {
      // Admission row
      const admissionDate = edu.startDate;
      if (admissionDate) {
        const dateObj = new Date(admissionDate);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = dateObj.getMonth() + 1;
          const eraYear = toJapaneseEraYear(year).replace('年', '');
          eduWorkRows.push({
            year: eraYear,
            month: `${month}`,
            detail: `${edu.school || ''}\u3000入学`
          });
        }
      }
      // Graduation row
      const gradDate = edu.endDate || edu.gradDate;
      if (gradDate) {
        const dateObj = new Date(gradDate);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = dateObj.getMonth() + 1;
          const eraYear = toJapaneseEraYear(year).replace('年', '');
          const degreeText = edu.major || edu.degree || '卒業';
          eduWorkRows.push({
            year: eraYear,
            month: `${month}`,
            detail: `${edu.school || ''}\u3000${degreeText}`
          });
        }
      }
    });
  }

  // 2. Work History
  if (profileData.workHistory && profileData.workHistory.length > 0) {
    eduWorkRows.push({ year: '', month: '', detail: '職　　歴', align: 'center' });
    profileData.workHistory.forEach(work => {
      if (work.startDate) {
        const dateObj = new Date(work.startDate);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const eraYear = toJapaneseEraYear(year).replace('年', '');
        eduWorkRows.push({
          year: eraYear,
          month: `${month}`,
          detail: `${work.company || ''}\u3000入社`
        });
      }
      if (work.isCurrent) {
        eduWorkRows.push({
          year: '',
          month: '',
          detail: '現在に至る'
        });
      } else if (work.endDate) {
        const dateObj = new Date(work.endDate);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const eraYear = toJapaneseEraYear(year).replace('年', '');
        eduWorkRows.push({
          year: eraYear,
          month: `${month}`,
          detail: `${work.company || ''}\u3000一身上の都合により退社`
        });
      }
    });
  }
  
  // Add "以上" at the end of Work History
  if (eduWorkRows.length > 0) {
    eduWorkRows.push({ year: '', month: '', detail: '以　　上', align: 'right' });
  }

  // Fill up to 10 rows for formatting consistency
  while (eduWorkRows.length < 12) {
    eduWorkRows.push({ year: '', month: '', detail: '' });
  }

  // Setup Licenses & Qualifications
  const licenseRows = [];
  
  // Add Driver licenses
  if (profileData.driverLicenses && profileData.driverLicenses.length > 0) {
    profileData.driverLicenses.forEach(lic => {
      // Maps to Japanese name
      let licName = '';
      switch(lic) {
        case 'futsu': licName = '普通自動車第一種免許'; break;
        case 'junchugata': licName = '準中型自動車免許'; break;
        case 'chugata': licName = '中型自動車第一種免許'; break;
        case 'oogata': licName = '大型自動車第一種免許'; break;
        case 'oogata_tokushu': licName = '大型特殊自動車免許'; break;
        case 'kogata_tokushu': licName = '小型特殊自動車免許'; break;
        case 'kenin': licName = '牽引第一種免許'; break;
        case 'motorcycle': licName = '普通自動二輪車免許'; break;
        case 'oogata_motorcycle': licName = '大型自動二輪車免許'; break;
        case 'gentsuki': licName = '原動機付自転車免許'; break;
        case 'futsu_nishu': licName = '普通自動車第二種免許'; break;
        case 'junchugata_nishu': licName = '準中型自動車第二種免許'; break;
        case 'chugata_nishu': licName = '中型自動車第二種免許'; break;
        case 'oogata_nishu': licName = '大型自動車第二種免許'; break;
        case 'oogata_tokushu_nishu': licName = '大型特殊自動車第二種免許'; break;
        case 'kenin_nishu': licName = '牽引第二種免許'; break;
        default: licName = `${lic.toUpperCase()} 運転免許`;
      }
      licenseRows.push({
        year: '令和X', // Just placeholder or based on certification date
        month: 'X',
        detail: `${licName} 取得`
      });
    });
  }

  // Add Tech certificates
  if (profileData.techCertificates && profileData.techCertificates.length > 0) {
    profileData.techCertificates.forEach(cert => {
      let certName = '';
      switch(cert) {
        case 'forklift': certName = 'フォークリフト運転技能講習'; break;
        case 'crane': certName = '小型移動式クレーン運転技能講習'; break;
        case 'towing': certName = '牽引自動車運転免許'; break;
        default: certName = `${cert.toUpperCase()} 資格`;
      }
      licenseRows.push({
        year: '令和X',
        month: 'X',
        detail: `${certName} 修了`
      });
    });
  }

  // Fill up to 6 rows
  while (licenseRows.length < 6) {
    licenseRows.push({ year: '', month: '', detail: '' });
  }

  // Build the PDF Document Definition
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [35, 40, 35, 40],
    defaultStyle: {
      font: 'SawarabiGothic',
      fontSize: 9.5,
      color: '#333333'
    },
    styles: {
      title: {
        fontSize: 18,
        bold: true,
        alignment: 'justify',
        characterSpacing: 6
      },
      subtitle: {
        fontSize: 7.5,
        alignment: 'right'
      },
      sectionTitle: {
        fontSize: 10,
        bold: true,
        margin: [0, 8, 0, 4]
      },
      label: {
        fontSize: 7,
        color: '#666666'
      },
      inputVal: {
        fontSize: 10
      }
    },
    content: [
      // Title Row
      {
        columns: [
          { text: '履　歴　書', style: 'title', width: '*' },
          { text: `${eraToday}`, style: 'subtitle', alignment: 'right', width: 'auto', margin: [0, 8, 0, 0] }
        ]
      },
      { text: '', margin: [0, 5] },

      // Personal Information Table (Furigana, Name, DOB, Gender, Photo)
      {
        table: {
          widths: ['*', 50, 80],
          body: [
            [
              {
                // Subtable for personal info to leave space for photo on right
                table: {
                  widths: [45, '*'],
                  body: [
                    [
                      { text: 'ふりがな', style: 'label', border: [false, false, false, true] },
                      { text: profileData.furigana || '', style: 'label', border: [false, false, false, true] }
                    ],
                    [
                      { text: '氏　　名', style: 'label', border: [false, false, false, false] },
                      { text: profileData.fullName || '', style: 'inputVal', bold: true, fontSize: 13, border: [false, false, false, false], margin: [0, 4, 0, 4] }
                    ]
                  ]
                },
                colSpan: 2,
                margin: [0, 0, 5, 0]
              },
              {},
              // Photo column placeholder or base64 avatar
              avatarBase64 ? {
                image: avatarBase64,
                width: 70,
                height: 90,
                alignment: 'center',
                rowSpan: 3,
                margin: [2, 2, 2, 2]
              } : {
                stack: [
                  { text: '写　真', style: 'label', alignment: 'center', margin: [0, 15, 0, 0] },
                  { text: '（3cm x 4cm）', fontSize: 6.5, color: '#999999', alignment: 'center', margin: [0, 4, 0, 0] },
                  { text: 'カラー・脱帽', fontSize: 6.5, color: '#999999', alignment: 'center' }
                ],
                alignment: 'center',
                rowSpan: 3,
                margin: [0, 0, 0, 0]
              }
            ],
            // Birth Date and Gender
            [
              {
                table: {
                  widths: [45, '*', 35, 20],
                  body: [
                    [
                      { text: '生年月日', style: 'label', border: [false, false, false, false] },
                      { text: eraBirthDate ? `${eraBirthDate} 生` : '', style: 'inputVal', border: [false, false, false, false] },
                      { text: `（満 ${age || '  '} 歳）`, style: 'inputVal', border: [false, false, false, false] },
                      { text: genderText, style: 'inputVal', alignment: 'center', border: [true, false, false, false] }
                    ]
                  ]
                },
                colSpan: 2,
                border: [true, true, true, true]
              },
              {},
              {}
            ],
            // Furigana Address and Postal code
            [
              {
                table: {
                  widths: [45, '*'],
                  body: [
                    [
                      { text: 'ふりがな', style: 'label', border: [false, false, false, true] },
                      { text: '', style: 'label', border: [false, false, false, true] }
                    ],
                    [
                      { text: '現 住 所', style: 'label', border: [false, false, false, false] },
                      { text: `〒 ${postalCode}\n${primaryAddress}`, style: 'inputVal', border: [false, false, false, false], margin: [0, 4, 0, 4] }
                    ]
                  ]
                },
                colSpan: 2,
                border: [true, true, true, true]
              },
              {},
              {}
            ],
            // Phone and Email
            [
              { text: '電話番号', style: 'label', border: [true, true, false, true] },
              { text: phone, style: 'inputVal', border: [false, true, true, true] },
              { text: `E-mail: ${email}`, style: 'inputVal', border: [true, true, true, true], fontSize: 8, colSpan: 1 }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#999999',
          vLineColor: () => '#999999'
        }
      },
      
      { text: '', margin: [0, 6] },

      // Education & Work History Table
      {
        table: {
          widths: [50, 30, '*'],
          body: [
            // Table Header
            [
              { text: '年', style: 'label', alignment: 'center', border: [true, true, true, true] },
              { text: '月', style: 'label', alignment: 'center', border: [true, true, true, true] },
              { text: '学 歴 ・ 職 歴', style: 'label', alignment: 'center', border: [true, true, true, true] }
            ],
            // Content Rows
            ...eduWorkRows.map(row => [
              { text: row.year, style: 'inputVal', alignment: 'center', border: [true, false, true, false], margin: [0, 2] },
              { text: row.month, style: 'inputVal', alignment: 'center', border: [true, false, true, false], margin: [0, 2] },
              { 
                text: row.detail, 
                style: 'inputVal', 
                alignment: row.align || 'left', 
                border: [true, false, true, false],
                margin: row.align === 'center' ? [0, 3] : [5, 2]
              }
            ]),
            // Empty closure border row
            [
              { text: '', border: [true, false, true, true], height: 2 },
              { text: '', border: [true, false, true, true], height: 2 },
              { text: '', border: [true, false, true, true], height: 2 }
            ]
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length - 1) ? 0.5 : 0.2,
          vLineWidth: () => 0.5,
          hLineColor: () => '#999999',
          vLineColor: () => '#999999'
        }
      },

      { text: '', margin: [0, 6] },

      // Licenses & Qualifications Table
      {
        table: {
          widths: [50, 30, '*'],
          body: [
            [
              { text: '年', style: 'label', alignment: 'center', border: [true, true, true, true] },
              { text: '月', style: 'label', alignment: 'center', border: [true, true, true, true] },
              { text: '免 許 ・ 資 格', style: 'label', alignment: 'center', border: [true, true, true, true] }
            ],
            ...licenseRows.map(row => [
              { text: row.year, style: 'inputVal', alignment: 'center', border: [true, false, true, false], margin: [0, 2] },
              { text: row.month, style: 'inputVal', alignment: 'center', border: [true, false, true, false], margin: [0, 2] },
              { text: row.detail, style: 'inputVal', border: [true, false, true, false], margin: [5, 2] }
            ]),
            [
              { text: '', border: [true, false, true, true], height: 2 },
              { text: '', border: [true, false, true, true], height: 2 },
              { text: '', border: [true, false, true, true], height: 2 }
            ]
          ]
        },
        layout: {
          hLineWidth: (i, node) => (i === 0 || i === 1 || i === node.table.body.length - 1) ? 0.5 : 0.2,
          vLineWidth: () => 0.5,
          hLineColor: () => '#999999',
          vLineColor: () => '#999999'
        }
      },

      { text: '', margin: [0, 6] },

      // Motivation / Self-PR and Hobbies
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                stack: [
                  { text: '志望動機・自己PR・特技など', style: 'label', margin: [0, 0, 0, 4] },
                  { 
                    text: `${profileData.motivation || ''}\n\n${profileData.selfPR || ''}`, 
                    style: 'inputVal', 
                    minHeight: 80, 
                    margin: [4, 4, 4, 4],
                    leadingHeight: 1.3
                  }
                ]
              }
            ],
            [
              {
                stack: [
                  { text: '趣味・特技', style: 'label', margin: [0, 0, 0, 4] },
                  { 
                    text: profileData.hobbies || '', 
                    style: 'inputVal', 
                    minHeight: 40, 
                    margin: [4, 4, 4, 4] 
                  }
                ]
              }
            ],
            [
              {
                stack: [
                  { text: '本人希望記入欄（特に給料・職種・勤務時間・勤務地・その他希望があれば記入）', style: 'label', margin: [0, 0, 0, 4] },
                  { 
                    text: personalRequestsText, 
                    style: 'inputVal', 
                    minHeight: 30, 
                    margin: [4, 4, 4, 4] 
                  }
                ]
              }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#999999',
          vLineColor: () => '#999999'
        }
      }
    ]
  };

  if (onProgress) onProgress('downloading');

  // Trigger PDF Download or open preview
  try {
    const pdf = pdfMake.createPdf(docDefinition);
    if (download) {
      const filename = `Rirekisho_${profileData.fullName.replace(/\s+/g, '_')}.pdf`;
      await pdf.download(filename);
      if (onProgress) onProgress('completed');
    } else {
      const blob = await pdf.getBlob();
      const blobUrl = URL.createObjectURL(blob);
      if (onProgress) onProgress('completed');
      return blobUrl;
    }
  } catch (e) {
    console.error('Error generating PDF:', e);
    if (onProgress) onProgress('failed');
    throw e;
  }
}
