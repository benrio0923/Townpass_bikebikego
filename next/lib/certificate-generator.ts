/**
 * 前端證書生成器
 * 使用 Canvas API 在瀏覽器中生成證書
 */

export interface CertificateData {
  userName: string;
  shape: string;
  completedTime: string;
  durationHours: number;
}

export async function generateCertificate(data: CertificateData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // 創建 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('無法創建 Canvas 上下文');
      }

      // 背景漸變
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#5AB4C5');
      gradient.addColorStop(0.5, '#71C5D5');
      gradient.addColorStop(1, '#93D4DF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 白色內框
      ctx.fillStyle = 'white';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

      // 裝飾邊框
      ctx.strokeStyle = '#5AB4C5';
      ctx.lineWidth = 8;
      ctx.strokeRect(70, 70, canvas.width - 140, canvas.height - 140);

      // 標題
      ctx.fillStyle = '#22474E';
      ctx.font = 'bold 72px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('完成證書', canvas.width / 2, 180);

      // 副標題
      ctx.font = '32px Arial, sans-serif';
      ctx.fillStyle = '#356C77';
      ctx.fillText('台北騎跡 - Taipei Cycling Trails', canvas.width / 2, 230);

      // 分隔線
      ctx.strokeStyle = '#B4E2EA';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(200, 260);
      ctx.lineTo(canvas.width - 200, 260);
      ctx.stroke();

      // 使用者名稱
      ctx.font = 'bold 48px Arial, sans-serif';
      ctx.fillStyle = '#22474E';
      ctx.fillText(data.userName || '騎行者', canvas.width / 2, 340);

      // 完成圖形
      ctx.font = 'bold 64px Arial, sans-serif';
      ctx.fillStyle = '#5AB4C5';
      ctx.fillText(`完成 ${data.shape} 字形路線`, canvas.width / 2, 430);

      // 圖標
      ctx.font = '80px Arial, sans-serif';
      ctx.fillText('🎉', canvas.width / 2, 520);

      // 完成資訊
      ctx.font = '28px Arial, sans-serif';
      ctx.fillStyle = '#356C77';
      
      // 耗時
      const hours = data.durationHours.toFixed(1);
      ctx.fillText(`耗時：${hours} 小時`, canvas.width / 2, 600);

      // 完成時間
      const date = new Date(data.completedTime);
      const formattedDate = date.toLocaleString('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      ctx.fillText(`完成於：${formattedDate}`, canvas.width / 2, 650);

      // 底部文字
      ctx.font = 'italic 24px Arial, sans-serif';
      ctx.fillStyle = '#93D4DF';
      ctx.fillText('恭喜完成挑戰！繼續探索台北之美！', canvas.width / 2, 720);

      // 轉換為 Blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('無法生成證書圖片'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
}

export function downloadCertificateBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

