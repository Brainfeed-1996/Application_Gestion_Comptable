'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Category } from '@/types/transaction';

export interface CategoryTreeNode {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  parentId?: string | null;
  children: CategoryTreeNode[];
  transactionCount: number;
}

interface CategoryManagerProps {
  categories: CategoryTreeNode[];
  onCategoriesChange?: (categories: CategoryTreeNode[]) => void;
}

const CATEGORY_COLORS = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#14b8a6', '#6366f1',
];

const CATEGORY_ICONS = ['📁', '💼', '🏠', '🚗', '📚', '🍽️', '💊', '🎉', '🏋️', '📱'];

function buildTree(flat: Category[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();
  const roots: CategoryTreeNode[] = [];

  flat.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [], transactionCount: 0 });
  });

  flat.forEach((cat) => {
    const node = map.get(cat.id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function CategoryManager({ categories, onCategoriesChange }: CategoryManagerProps) {
  const [categoryName, setCategoryName] = useState('');
  const [parentId, setParentId] = useState('');
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
  const [tree, setTree] = useState<CategoryTreeNode[]>(() => buildTree(categories));
  const [editingId, setEditingId] = useState<string | null>(null);

  const flatCategories = flattenTree(tree);

  const handleAdd = useCallback(() => {
    if (!categoryName.trim()) return;
    const newCat: Category = {
      id: editingId || `cat_${Date.now()}`,
      name: categoryName.trim(),
      color: selectedColor,
      icon: selectedIcon,
      parentId: parentId || undefined,
    };
    const updated = editingId
      ? flatCategories.map((c) => (c.id === editingId ? newCat : c))
      : [...flatCategories, newCat];
    setTree(buildTree(updated));
    onCategoriesChange?.(updated);
    setCategoryName('');
    setParentId('');
    setEditingId(null);
  }, [categoryName, parentId, selectedColor, selectedIcon, editingId, flatCategories, onCategoriesChange]);

  const handleDelete = useCallback(
    (id: string) => {
      const toDelete = new Set<string>([id]);
      const collectChildren = (items: CategoryTreeNode[]) => {
        items.forEach((item) => {
          if (item.parentId === id || toDelete.has(item.id)) {
            toDelete.add(item.id);
            collectChildren(item.children);
          }
        });
      };
      collectChildren(tree);
      const updated = flatCategories.filter((c) => !toDelete.has(c.id));
      setTree(buildTree(updated));
      onCategoriesChange?.(updated);
    },
    [tree, flatCategories, onCategoriesChange]
  );

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;
      const items = Array.from(flatCategories);
      const [reordered] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reordered);
      setTree(buildTree(items));
      onCategoriesChange?.(items);
    },
    [flatCategories, onCategoriesChange]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une catégorie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="cat-name" className="text-sm font-medium">Nom</label>
            <Input
              id="cat-name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Nom de la catégorie"
              aria-label="Nom de la catégorie"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="cat-parent" className="text-sm font-medium">Catégorie parente</label>
              <Select value={parentId} onValueChange={setParentId} aria-label="Catégorie parente">
                <option value="">Aucune</option>
                {flatCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur</label>
              <div className="flex gap-2" role="radiogroup" aria-label="Choix de couleur">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all',
                      selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    role="radio"
                    aria-checked={selectedColor === color}
                    aria-label={`Couleur ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icône</label>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Choix d'icône">
              {CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon}
                  className={cn(
                    'h-10 w-10 flex items-center justify-center rounded-lg border transition-all text-lg',
                    selectedIcon === icon ? 'border-primary bg-primary/10' : 'border-input'
                  )}
                  onClick={() => setSelectedIcon(icon)}
                  role="radio"
                  aria-checked={selectedIcon === icon}
                  aria-label={`Icône ${icon}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleAdd}>
            {editingId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Arborescence des catégories</CardTitle>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="categories">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-1"
                  aria-label="Catégories (glisser-déposer pour réordonner)"
                >
                  {tree.map((node, index) => (
                    <Draggable key={node.id} draggableId={node.id} index={index}>
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            'flex items-center gap-3 rounded-lg border p-3 hover:bg-accent',
                            'focus:outline-none focus:ring-2 focus:ring-ring'
                          )}
                        >
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: node.color }}
                            aria-hidden="true"
                          />
                          <span aria-hidden="true">{node.icon}</span>
                          <span className="font-medium">{node.name}</span>
                          <Badge variant="secondary">{node.transactionCount}</Badge>
                          {node.parentId && (
                            <Badge variant="outline" className="ml-auto">
                              Sous-catégorie
                            </Badge>
                          )}
                          <div className="flex gap-1 ml-auto">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCategoryName(node.name);
                                setParentId(node.parentId || '');
                                setSelectedColor(node.color || CATEGORY_COLORS[0]);
                                setSelectedIcon(node.icon || CATEGORY_ICONS[0]);
                                setEditingId(node.id);
                              }}
                              aria-label={`Modifier ${node.name}`}
                            >
                              ✏️
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(node.id)}
                              aria-label={`Supprimer ${node.name}`}
                              className="text-destructive"
                            >
                              🗑️
                            </Button>
                          </div>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
}

function flattenTree(nodes: CategoryTreeNode[]): Category[] {
  const result: Category[] = [];
  nodes.forEach((node) => {
    result.push({ id: node.id, name: node.name, color: node.color, icon: node.icon, parentId: node.parentId });
    if (node.children.length > 0) {
      result.push(...flattenTree(node.children));
    }
  });
  return result;
}
