import os

folder_path = r'C:\Disk D\Reset ha\Web_Projects\Luu_tru_anh\images\lover'

# Lặp qua tất cả file có tên bắt đầu bằng '2(' và kết thúc bằng ảnh
for filename in os.listdir(folder_path):
    if filename.startswith("2(") and filename.lower().endswith(('.jpg', '.jpeg', '.png', '.bmp', '.gif')):
        old_path = os.path.join(folder_path, filename)
        
        # Đổi tên thành '2 (i).jpg'
        new_filename = filename.replace("2(", "2 (")
        new_path = os.path.join(folder_path, new_filename)

        os.rename(old_path, new_path)

print("✅ Đã thêm dấu cách giữa 2 và (i).")
