export interface MenuItem {
  group: string;
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  items: Array<SubMenuItem>;
  // Thêm thuộc tính roles để kiểm tra quyền cho cả nhóm
  roles?: string[];
}

export interface SubMenuItem {
  icon?: string;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
  // Thêm thuộc tính roles để kiểm tra quyền cho từng mục
  roles?: string[];
}
