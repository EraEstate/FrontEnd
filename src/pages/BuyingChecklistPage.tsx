import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { buyingChecklistAPI, type BuyingChecklist } from '../api/buyingChecklist';
import { showError, showSuccess } from '../utils/toast';

interface ChecklistItem {
  label: string;
  checked: boolean;
  note?: string;
}

interface ChecklistGroup {
  group: string;
  items: ChecklistItem[];
}

const defaultItems: ChecklistGroup[] = [
  {
    group: 'Tai chinh',
    items: [
      { label: 'Kiem tra ngan sach ca nhan', checked: false },
      { label: 'Tinh toan kha nang vay', checked: false },
      { label: 'Du phong chi phi phat sinh', checked: false },
      { label: 'Xac dinh don bay tai chinh', checked: false },
      { label: 'Kiem tra lai suat ngan hang', checked: false },
    ],
  },
  {
    group: 'Phap ly',
    items: [
      { label: 'Kiem tra so do/san pham phap ly', checked: false },
      { label: 'Xac minh quy hoach khu dat', checked: false },
      { label: 'Kiem tra tinh trang the chap', checked: false },
      { label: 'Doi chieu thong tin chu so huu', checked: false },
      { label: 'Kiem tra hop dong dat coc', checked: false },
      { label: 'Tham van luat su neu can', checked: false },
    ],
  },
  {
    group: 'Kiem tra thuc te',
    items: [
      { label: 'Khao sat ha tang xung quanh', checked: false },
      { label: 'Do dac dien tich thuc te', checked: false },
      { label: 'Kiem tra chat luong cong trinh', checked: false },
      { label: 'Danh gia an ninh khu vuc', checked: false },
      { label: 'Kiem tra van hanh he thong dien nuoc', checked: false },
    ],
  },
  {
    group: 'Hoan tat giao dich',
    items: [
      { label: 'Ky hop dong mua ban', checked: false },
      { label: 'Cong chung va nop thue', checked: false },
      { label: 'Dang bo sang ten', checked: false },
      { label: 'Ban giao nha va ho so', checked: false },
    ],
  },
];

const parseItems = (itemsJson: string): ChecklistGroup[] => {
  try {
    const parsed = JSON.parse(itemsJson);
    return Array.isArray(parsed) ? parsed : defaultItems;
  } catch {
    return defaultItems;
  }
};

const calculateProgress = (groups: ChecklistGroup[]) => {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0);
  const done = groups.reduce((sum, group) => sum + group.items.filter((item) => item.checked).length, 0);
  return total === 0 ? 0 : Math.round((done * 100) / total);
};

const BuyingChecklistPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [titleInput, setTitleInput] = useState('');
  const [checklists, setChecklists] = useState<BuyingChecklist[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());

  const totalProgress = useMemo(() => {
    if (checklists.length === 0) return 0;
    return Math.round(checklists.reduce((sum, item) => sum + (item.progress || 0), 0) / checklists.length);
  }, [checklists]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await buyingChecklistAPI.getAll();
      setChecklists(Array.isArray(data) ? data : []);
    } catch {
      showError('Khong the tai checklist.');
      setChecklists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createChecklist = async () => {
    try {
      const created = await buyingChecklistAPI.create({
        title: titleInput.trim() || `Checklist mua nha #${checklists.length + 1}`,
        items: JSON.stringify(defaultItems),
      });
      setChecklists((prev) => [created, ...prev]);
      setExpandedId(created.id);
      setTitleInput('');
      showSuccess('Da tao checklist moi.');
    } catch {
      showError('Khong the tao checklist.');
    }
  };

  const removeChecklist = async (id: string) => {
    try {
      await buyingChecklistAPI.remove(id);
      setChecklists((prev) => prev.filter((item) => item.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
      showSuccess('Da xoa checklist.');
    } catch {
      showError('Khong the xoa checklist.');
    }
  };

  const updateChecklistItems = async (checklist: BuyingChecklist, groups: ChecklistGroup[]) => {
    const nextItems = JSON.stringify(groups);
    const nextProgress = calculateProgress(groups);
    setChecklists((prev) =>
      prev.map((item) => (item.id === checklist.id ? { ...item, items: nextItems, progress: nextProgress } : item))
    );
    setSavingIds((prev) => new Set(prev).add(checklist.id));
    try {
      await buyingChecklistAPI.update(checklist.id, { title: checklist.title, items: nextItems });
    } catch {
      showError('Khong the luu thay doi checklist.');
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(checklist.id);
        return next;
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 pt-24 text-center text-gray-500">Dang tai checklist…</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-red-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-semibold text-gray-900">Checklist Mua Nha</h1>
            <div className="flex w-full gap-2 md:w-auto">
              <input
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                className="h-10 flex-1 rounded-full border border-red-200 px-4 text-sm font-semibold outline-none focus:border-red-500"
                placeholder="Ten checklist moi…"
              />
              <button
                onClick={createChecklist}
                className="inline-flex items-center gap-1 rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4" />
                Tao checklist moi
              </button>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">Tien do tong the</span>
              <span className="font-bold text-red-600">{totalProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-red-100">
              <div className="h-2 rounded-full bg-red-600" style={{ width: `${totalProgress}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {checklists.map((checklist) => {
            const groups = parseItems(checklist.items);
            const expanded = expandedId === checklist.id;
            const saving = savingIds.has(checklist.id);

            return (
              <article key={checklist.id} className="rounded-2xl border border-red-100 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-gray-900">{checklist.title}</h2>
                    <p className="text-xs text-gray-500">
                      Tao ngay <span suppressHydrationWarning>{new Date(checklist.createdAt).toLocaleDateString('vi-VN')}</span> · Tien do {checklist.progress}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2" suppressHydrationWarning>
                    {saving && <span className="text-xs font-semibold text-red-600">Dang luu…</span>}
                    <button
                      onClick={() => setExpandedId(expanded ? null : checklist.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-700"
                    >
                      {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      {expanded ? 'An' : 'Xem'}
                    </button>
                    <button
                      onClick={() => removeChecklist(checklist.id)}
                      className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3" />
                      Xoa
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="space-y-4 border-t px-5 py-4">
                    {groups.map((group, groupIndex) => (
                      <div key={`${group.group}-${groupIndex}`} className="rounded-xl border border-red-100 p-4">
                        <h3 className="font-semibold text-gray-900">{group.group}</h3>
                        <div className="mt-3 grid gap-2">
                          {group.items.map((item, itemIndex) => (
                            <label key={`${item.label}-${itemIndex}`} className="flex items-center gap-3 rounded-lg border border-gray-100 px-3 py-2">
                              <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={(event) => {
                                  const nextGroups = groups.map((g, gIndex) =>
                                    gIndex !== groupIndex
                                      ? g
                                      : {
                                          ...g,
                                          items: g.items.map((it, itIndex) =>
                                            itIndex !== itemIndex ? it : { ...it, checked: event.target.checked }
                                          ),
                                        }
                                  );
                                  updateChecklistItems(checklist, nextGroups);
                                }}
                                className="h-4 w-4 accent-red-600"
                              />
                              <span className="text-sm text-gray-700">{item.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
          {checklists.length === 0 && <p className="text-center text-sm text-gray-500">Ban chua co checklist nao.</p>}
        </div>
      </div>
    </div>
  );
};

export default BuyingChecklistPage;
