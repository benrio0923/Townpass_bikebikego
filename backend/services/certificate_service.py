"""
Certificate Generation Service
使用 PIL (Pillow) 在證書模板上疊加個人化資訊
"""
from PIL import Image, ImageDraw, ImageFont
import io
import os
from datetime import datetime
from typing import Optional

# 證書模板路徑
CERTIFICATE_TEMPLATE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
    "Certificate template.png"
)

# 字型檔案路徑（如果系統沒有，可以使用預設字型）
FONT_PATH_REGULAR = "/System/Library/Fonts/PingFang.ttc"  # macOS
FONT_PATH_BOLD = "/System/Library/Fonts/PingFang.ttc"

# 如果 macOS 字型不存在，嘗試 Linux 字型
if not os.path.exists(FONT_PATH_REGULAR):
    FONT_PATH_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    FONT_PATH_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

def get_shape_name(shape: str) -> str:
    """將字母轉換為中文描述"""
    shape_names = {
        'T': 'T 字形',
        'A': 'A 字形',
        'I': 'I 字形',
        'P': 'P 字形',
        'E': 'E 字形',
        'S': 'S 字形',
        'U': 'U 字形',
        'O': 'O 字形',
        'L': 'L 字形',
    }
    return shape_names.get(shape.upper(), f'{shape.upper()} 字形')

def generate_certificate(
    user_name: str,
    shape: str,
    completed_time: str,
    duration_hours: float
) -> bytes:
    """
    生成個人化證書
    
    Args:
        user_name: 使用者名稱（例如：唐翔千）
        shape: 完成的字母形狀（例如：T）
        completed_time: 完成時間（ISO 格式）
        duration_hours: 耗時（小時）
    
    Returns:
        證書圖片的 bytes
    """
    try:
        # 開啟模板圖片
        template = Image.open(CERTIFICATE_TEMPLATE_PATH)
        draw = ImageDraw.Draw(template)
        
        # 載入字型（如果失敗則使用預設字型）
        try:
            # 不同大小的字型
            font_name = ImageFont.truetype(FONT_PATH_BOLD, 120)  # 使用者名稱
            font_details = ImageFont.truetype(FONT_PATH_REGULAR, 50)  # 詳細資訊
            font_date = ImageFont.truetype(FONT_PATH_REGULAR, 40)  # 日期
        except:
            # 如果載入字型失敗，使用預設字型
            font_name = ImageFont.load_default()
            font_details = ImageFont.load_default()
            font_date = ImageFont.load_default()
        
        # 取得圖片尺寸
        width, height = template.size
        
        # 金色文字顏色
        gold_color = (218, 165, 32)  # 金色
        
        # 1. 使用者名稱（中央偏上，大字體）
        # 位置大約在 650px
        name_bbox = draw.textbbox((0, 0), user_name, font=font_name)
        name_width = name_bbox[2] - name_bbox[0]
        name_x = (width - name_width) // 2
        name_y = 600
        draw.text((name_x, name_y), user_name, font=font_name, fill=gold_color)
        
        # 2. 完成資訊（名字下方）
        shape_name = get_shape_name(shape)
        completion_text = f"於本年度完成台北通台北騎跡挑戰-"
        completion_text2 = f"YouBike景點巡禮"
        
        # 第一行
        text1_bbox = draw.textbbox((0, 0), completion_text, font=font_details)
        text1_width = text1_bbox[2] - text1_bbox[0]
        text1_x = (width - text1_width) // 2
        text1_y = 800
        draw.text((text1_x, text1_y), completion_text, font=font_details, fill=gold_color)
        
        # 第二行
        text2_bbox = draw.textbbox((0, 0), completion_text2, font=font_details)
        text2_width = text2_bbox[2] - text2_bbox[0]
        text2_x = (width - text2_width) // 2
        text2_y = 860
        draw.text((text2_x, text2_y), completion_text2, font=font_details, fill=gold_color)
        
        # 3. 獎勵文字
        reward_text = "特頒此狀，以茲鼓勵"
        reward_bbox = draw.textbbox((0, 0), reward_text, font=font_details)
        reward_width = reward_bbox[2] - reward_bbox[0]
        reward_x = (width - reward_width) // 2
        reward_y = 950
        draw.text((reward_x, reward_y), reward_text, font=font_details, fill=gold_color)
        
        # 4. 完成日期（底部）
        # 解析完成時間
        try:
            dt = datetime.fromisoformat(completed_time.replace('Z', '+00:00'))
            date_str = f"西元{dt.year}年{dt.month}月{dt.day}日"
        except:
            date_str = "西元2025年11月9日"
        
        date_bbox = draw.textbbox((0, 0), date_str, font=font_date)
        date_width = date_bbox[2] - date_bbox[0]
        date_x = (width - date_width) // 2
        date_y = 1070
        draw.text((date_x, date_y), date_str, font=font_date, fill=gold_color)
        
        # 將圖片轉換為 bytes
        img_byte_arr = io.BytesIO()
        template.save(img_byte_arr, format='PNG', quality=95)
        img_byte_arr.seek(0)
        
        return img_byte_arr.getvalue()
        
    except Exception as e:
        print(f"❌ 生成證書失敗: {e}")
        import traceback
        traceback.print_exc()
        raise

def save_certificate(
    certificate_bytes: bytes,
    output_path: str
) -> bool:
    """
    將證書保存到檔案
    
    Args:
        certificate_bytes: 證書圖片的 bytes
        output_path: 輸出檔案路徑
    
    Returns:
        是否成功
    """
    try:
        with open(output_path, 'wb') as f:
            f.write(certificate_bytes)
        print(f"✅ 證書已保存到: {output_path}")
        return True
    except Exception as e:
        print(f"❌ 保存證書失敗: {e}")
        return False

# 測試函數
if __name__ == "__main__":
    # 測試生成證書
    print("🎓 測試證書生成...")
    
    cert_bytes = generate_certificate(
        user_name="唐翔千",
        shape="T",
        completed_time="2025-11-08T14:30:00",
        duration_hours=3.0
    )
    
    # 保存測試證書
    test_output = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "test_certificate.png"
    )
    save_certificate(cert_bytes, test_output)
    print("✅ 測試完成！")

