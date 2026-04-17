import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type ExpenseItem = {
  id: string;
  remoteId?: string;
  merchant: string;
  amount: number;
  amountPrefix?: '+' | '-';
  category: string;
  time: string;
  note?: string;
  createdAt?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  categoryColor?: string;
};

type ExpenseItemCardProps = {
  expense: ExpenseItem;
  showDivider?: boolean;
  showActions?: boolean;
  enforceSameDayActions?: boolean;
  isMenuOpen?: boolean;
  onToggleMenu?: (expense: ExpenseItem) => void;
  onCloseMenu?: () => void;
  onEdit?: (expense: ExpenseItem) => void;
  onDelete?: (expense: ExpenseItem) => void;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(value);

const isSameLocalDay = (dateString?: string) => {
  if (!dateString) {
    return false;
  }

  const created = new Date(dateString);
  if (Number.isNaN(created.getTime())) {
    return false;
  }

  const now = new Date();
  return (
    created.getFullYear() === now.getFullYear() &&
    created.getMonth() === now.getMonth() &&
    created.getDate() === now.getDate()
  );
};

export function ExpenseItemCard({
  expense,
  showDivider = false,
  showActions = false,
  enforceSameDayActions = false,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onEdit,
  onDelete,
}: ExpenseItemCardProps) {
  const [localIsMenuOpen, setLocalIsMenuOpen] = useState(false);
  const resolvedIsMenuOpen = isMenuOpen ?? localIsMenuOpen;
  const canEdit = !enforceSameDayActions || isSameLocalDay(expense.createdAt);
  const titleText = expense.note?.trim() || expense.merchant;

  const toggleMenu = () => {
    if (onToggleMenu) {
      onToggleMenu(expense);
      return;
    }

    setLocalIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    if (onCloseMenu) {
      onCloseMenu();
      return;
    }

    setLocalIsMenuOpen(false);
  };

  return (
    <View style={[styles.expenseRow, showDivider && styles.rowDivider]}>
      <View style={styles.expenseLeft}>
        <Ionicons
          name={expense.icon}
          size={22}
          color={expense.iconColor ?? '#111827'}
          style={styles.expenseIcon}
        />
        <View style={styles.expenseLeftTextWrap}>
          <Text style={styles.expenseMerchant} numberOfLines={1} ellipsizeMode="tail">
            {titleText}
          </Text>
          <Text style={styles.expenseMeta}>{expense.time}</Text>
        </View>
      </View>

      <View style={styles.expenseRightSection}>
        <View style={styles.expenseRight}>
          <Text style={styles.expenseAmount}>{expense.amountPrefix ?? '-'}{formatMoney(expense.amount)}</Text>
          <Text style={[styles.expenseMeta, expense.categoryColor && { color: expense.categoryColor }]}>
            {expense.category}
          </Text>
        </View>

        {showActions && (
          <View style={styles.actionsWrap}>
            <Pressable
              style={styles.moreButton}
              hitSlop={8}
              onPress={toggleMenu}>
              <Ionicons name="ellipsis-vertical" size={16} color="#475569" />
            </Pressable>

            {resolvedIsMenuOpen && (
              <View style={styles.menuPanel}>
                <>
                  {canEdit ? (
                    <Pressable
                      style={styles.menuAction}
                      onPress={() => {
                        closeMenu();
                        onEdit?.(expense);
                      }}>
                      <Text style={styles.menuActionText}>Edit</Text>
                    </Pressable>
                  ) : (
                    <Text style={styles.menuInfoText}>Edit available only on the same day.</Text>
                  )}

                    <Pressable
                      style={[styles.menuAction, styles.menuActionDanger]}
                      onPress={() => {
                        closeMenu();
                        onDelete?.(expense);
                      }}>
                      <Text style={[styles.menuActionText, styles.menuActionDangerText]}>Delete</Text>
                    </Pressable>
                </>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  expenseLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  expenseLeftTextWrap: {
    flex: 1,
  },
  expenseIcon: {
    marginRight: 8,
  },
  expenseMerchant: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
  },
  expenseRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  expenseRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    gap: 6,
  },
  expenseAmount: {
    fontSize: 17,
    color: '#111827',
    fontWeight: '600',
  },
  expenseMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsWrap: {
    position: 'relative',
  },
  moreButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  menuPanel: {
    position: 'absolute',
    top: 30,
    right: 0,
    minWidth: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
    paddingVertical: 4,
  },
  menuAction: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  menuActionDanger: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  menuActionText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  menuActionDangerText: {
    color: '#B91C1C',
  },
  menuInfoText: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
});