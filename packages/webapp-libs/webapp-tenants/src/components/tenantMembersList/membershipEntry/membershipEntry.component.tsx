import { useMutation, useQuery } from '@apollo/client/react';
import { TenantMembershipType, TenantUserRole, getFragmentData } from '@sb/webapp-api-client';
import { commonQueryMembershipFragment } from '@sb/webapp-api-client/providers';
import { Button } from '@sb/webapp-core/components/buttons';
import { ConfirmDialog } from '@sb/webapp-core/components/confirmDialog';
import { Checkbox } from '@sb/webapp-core/components/forms/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@sb/webapp-core/components/ui/avatar';
import { Badge } from '@sb/webapp-core/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@sb/webapp-core/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Skeleton as SkeletonComponent } from '@sb/webapp-core/components/ui/skeleton';
import { TableCell, TableRow } from '@sb/webapp-core/components/ui/table';
import { cn } from '@sb/webapp-core/lib/utils';
import { useToast } from '@sb/webapp-core/toast';
import { Crown, GripHorizontal, Hourglass, RefreshCw, Settings2, Trash2, UserCheck } from 'lucide-react';
import { trim } from 'ramda';
import { useCallback, useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { usePermissionCheck } from '../../../hooks';
import { useCurrentTenant } from '../../../providers';
import {
  allOrganizationRolesQuery,
  assignRolesToMemberMutation,
} from '../../../routes/tenantSettings/tenantRoles/tenantRoles.graphql';
import {
  deleteTenantMembershipMutation,
  resendTenantInvitationMutation,
} from './membershipEntry.graphql';

// Role color mapping
const ROLE_COLOR_CLASSES: Record<string, string> = {
  BLUE: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  GREEN: 'bg-green-500/10 text-green-700 border-green-500/30',
  RED: 'bg-red-500/10 text-red-700 border-red-500/30',
  YELLOW: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30',
  PURPLE: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
  ORANGE: 'bg-orange-500/10 text-orange-700 border-orange-500/30',
  PINK: 'bg-pink-500/10 text-pink-700 border-pink-500/30',
  TEAL: 'bg-teal-500/10 text-teal-700 border-teal-500/30',
  GRAY: 'bg-gray-500/10 text-gray-700 border-gray-500/30',
};

interface OrganizationRoleInfo {
  id: string;
  name: string;
  description?: string;
  color?: string | null;
  isSystemRole?: boolean | null;
  isOwnerRole?: boolean | null;
}

export type MembershipEntryProps = {
  className?: string;
  membership: TenantMembershipType & {
    organizationRoles?: OrganizationRoleInfo[] | null;
  };
  onAfterUpdate?: () => void;
};

// Role color badge component
const RoleColorBadge = ({ color }: { color: string }) => {
  const colorClasses: Record<string, string> = {
    BLUE: 'bg-blue-500',
    GREEN: 'bg-green-500',
    RED: 'bg-red-500',
    PURPLE: 'bg-purple-500',
    YELLOW: 'bg-yellow-500',
    ORANGE: 'bg-orange-500',
    PINK: 'bg-pink-500',
    TEAL: 'bg-teal-500',
    GRAY: 'bg-gray-500',
  };
  return <div className={cn('h-3 w-3 rounded-full', colorClasses[color] || 'bg-blue-500')} />;
};

export const MembershipEntry = ({ membership, className, onAfterUpdate }: MembershipEntryProps) => {
  const { data: currentTenant } = useCurrentTenant();
  const tenantId = currentTenant?.id ?? '';
  const { toast } = useToast();
  const intl = useIntl();
  const isCurrentUserMembership =
    getFragmentData(commonQueryMembershipFragment, currentTenant?.membership)?.id === membership?.id;

  // Permission checks
  const { hasPermission: canEditRoles } = usePermissionCheck('members.roles.edit');
  const { hasPermission: canRemoveMembers } = usePermissionCheck('members.remove');

  const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  // Fetch all organization roles for role assignment
  const { data: rolesData } = useQuery(allOrganizationRolesQuery, {
    variables: { tenantId },
    skip: !tenantId,
  });

  const availableRoles = useMemo((): OrganizationRoleInfo[] => {
    return (rolesData?.allOrganizationRoles?.edges || [])
      .map((edge) => edge?.node)
      .filter((role): role is NonNullable<typeof role> => role != null)
      .map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? undefined,
        color: role.color ?? undefined,
        isSystemRole: role.isSystemRole ?? undefined,
        isOwnerRole: role.isOwnerRole ?? undefined,
      }));
  }, [rolesData]);

  const updateSuccessMessage = intl.formatMessage({
    id: 'Membership Entry / UpdateRole / Success message',
    defaultMessage: 'The user roles were updated successfully!',
  });

  const updateFailMessage = intl.formatMessage({
    id: 'Membership Entry / UpdateRole / Fail message',
    defaultMessage: 'Unable to change the user roles.',
  });

  const deleteSuccessMessage = intl.formatMessage({
    id: 'Membership Entry / DeleteMembership / Success message',
    defaultMessage: 'User was removed successfully!',
  });

  const deleteFailMessage = intl.formatMessage({
    id: 'Membership Entry / DeleteMembership / Fail message',
    defaultMessage: 'Unable to delete the user.',
  });

  const resendSuccessMessage = intl.formatMessage({
    id: 'Membership Entry / ResendInvitation / Success message',
    defaultMessage: 'Invitation was resent successfully!',
  });

  const resendFailMessage = intl.formatMessage({
    id: 'Membership Entry / ResendInvitation / Fail message',
    defaultMessage: 'Unable to resend the invitation.',
  });

  const [commitAssignRolesMutation, { loading: assignLoading }] = useMutation(assignRolesToMemberMutation, {
    onCompleted: () => {
      toast({ description: updateSuccessMessage, variant: 'success' });
      setRolesDialogOpen(false);
      onAfterUpdate?.();
    },
    onError: () => {
      toast({ description: updateFailMessage, variant: 'destructive' });
    },
  });

  const [commitDeleteMutation] = useMutation(deleteTenantMembershipMutation, {
    onCompleted: () => {
      toast({ description: deleteSuccessMessage, variant: 'success' });
      onAfterUpdate?.();
    },
    onError: () => {
      toast({ description: deleteFailMessage, variant: 'destructive' });
    },
  });

  const [commitResendMutation, { loading: resendLoading }] = useMutation(resendTenantInvitationMutation, {
    onCompleted: () => {
      toast({ description: resendSuccessMessage, variant: 'success' });
    },
    onError: () => {
      toast({ description: resendFailMessage, variant: 'destructive' });
    },
  });

  const openRolesDialog = useCallback(() => {
    // Initialize with current roles
    const currentRoleIds = new Set(
      (membership.organizationRoles || [])
        .filter((r): r is NonNullable<typeof r> => r != null)
        .map((r) => r.id)
    );
    setSelectedRoleIds(currentRoleIds);
    setRolesDialogOpen(true);
  }, [membership.organizationRoles]);

  const toggleRole = useCallback((roleId: string) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) {
        next.delete(roleId);
      } else {
        next.add(roleId);
      }
      return next;
    });
  }, []);

  const saveRoles = useCallback(() => {
    if (!currentTenant) return;

    commitAssignRolesMutation({
      variables: {
        membershipId: membership.id,
        tenantId: currentTenant.id,
        roleIds: Array.from(selectedRoleIds),
      },
    });
  }, [currentTenant, membership.id, selectedRoleIds, commitAssignRolesMutation]);

  const deleteMembership = () => {
    if (!currentTenant) return;

    commitDeleteMutation({
      variables: {
        input: {
          id: membership.id,
          tenantId: currentTenant.id,
        },
      },
    });
  };

  const resendInvitation = () => {
    if (!currentTenant) return;

    commitResendMutation({
      variables: {
        input: {
          id: membership.id,
          tenantId: currentTenant.id,
        },
      },
    });
  };

  const name = trim([membership.firstName, membership.lastName].map((s) => trim(s ?? '')).join(' '));
  const hasName = !!name;
  const displayName = name || membership.userEmail || membership.inviteeEmailAddress;
  const email = membership.userEmail || membership.inviteeEmailAddress;
  const avatarInitial = membership.firstName?.[0]?.toUpperCase() || membership.userEmail?.[0]?.toUpperCase() || 'U';
  const avatarSrc = membership.avatar && membership.avatar !== null ? membership.avatar : undefined;


  return (
    <>
      <TableRow className={className}>
        <TableCell>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatarSrc} alt={displayName || ''} />
              <AvatarFallback className="text-xs">{avatarInitial}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              {hasName ? (
                <>
                  <span className="font-medium">{displayName}</span>
                  {email && <span className="text-xs text-muted-foreground">{email}</span>}
                </>
              ) : (
                <span className="text-muted-foreground">{displayName}</span>
              )}
            </div>
          </div>
        </TableCell>

        <TableCell>
          {membership.organizationRoles && membership.organizationRoles.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {membership.organizationRoles
                .filter((role): role is NonNullable<typeof role> => role != null)
                .map((role) => (
                  <Badge
                    key={role.id}
                    variant="outline"
                    className={cn(
                      'text-xs font-medium',
                      ROLE_COLOR_CLASSES[role.color || 'BLUE'] || ROLE_COLOR_CLASSES['BLUE']
                    )}
                  >
                    {role.isOwnerRole && <Crown className="h-3 w-3 mr-1" />}
                    {role.name}
                  </Badge>
                ))}
            </div>
          ) : (
            // Fallback to legacy role if no organization roles
            <Badge variant="secondary" className="text-xs">
              {membership.role}
            </Badge>
          )}
        </TableCell>
        <TableCell>
          {membership.invitationAccepted ? (
            <div className="flex items-center">
              <UserCheck className="mr-2 w-4 h-4" />
              <FormattedMessage id="Tenant Membersip Entry / Yes" defaultMessage="Yes" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <Hourglass className="mr-2 w-4 h-4" />
                <FormattedMessage id="Tenant Membersip Entry / No" defaultMessage="No" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={resendInvitation}
                disabled={resendLoading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                <FormattedMessage id="Tenant Membersip Entry / Resend" defaultMessage="Resend" />
              </Button>
            </div>
          )}
        </TableCell>
        <TableCell>
          {/* Only show actions dropdown if user has any action permissions */}
          {(canEditRoles || canRemoveMembers) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" role="button">
                  <GripHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <FormattedMessage id="Tenant Membersip Entry / Actions" defaultMessage="Actions" />
                </DropdownMenuLabel>
                {/* Show manage roles if user has members.roles.edit permission */}
                {canEditRoles && (
                  <DropdownMenuItem onClick={openRolesDialog}>
                    <Settings2 className="h-4 w-4 mr-2" />
                    <FormattedMessage id="Tenant Membersip Entry / Manage roles" defaultMessage="Manage roles" />
                  </DropdownMenuItem>
                )}
                {/* Show delete if user has members.remove permission and not their own membership */}
                {canRemoveMembers && !isCurrentUserMembership && (
                  <ConfirmDialog
                    onContinue={deleteMembership}
                    title={
                      <FormattedMessage id="Tenant Membersip Entry / Confirm Dialog / Delete Title" defaultMessage="Delete" />
                    }
                    description={
                      <FormattedMessage
                        id="Tenant Membersip Entry / Confirm Dialog / Delete Description"
                        defaultMessage="Are you sure you want to delete this member?"
                      />
                    }
                    variant="destructive"
                  >
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      <FormattedMessage id="Tenant Membersip Entry / Delete" defaultMessage="Delete" />
                    </DropdownMenuItem>
                  </ConfirmDialog>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </TableCell>
      </TableRow>

      {/* Manage Roles Dialog */}
      <Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage defaultMessage="Manage Roles" id="Membership Entry / Manage Roles Title" />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage
                defaultMessage="Select which roles to assign to {name}"
                id="Membership Entry / Manage Roles Description"
                values={{ name: displayName }}
              />
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-64 overflow-y-auto py-4">
            {availableRoles.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);

              return (
                <div
                  key={role.id}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors',
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/50'
                  )}
                  onClick={() => toggleRole(role.id)}
                >
                  <Checkbox checked={isSelected} />
                  <RoleColorBadge color={role.color || 'BLUE'} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{role.name}</span>
                      {role.isSystemRole && (
                        <Badge variant="secondary" className="text-xs">
                          <FormattedMessage defaultMessage="System" id="Membership Entry / System Badge" />
                        </Badge>
                      )}
                      {role.isOwnerRole && <Crown className="h-3 w-3 text-violet-500" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRolesDialogOpen(false)}>
              <FormattedMessage defaultMessage="Cancel" id="Membership Entry / Cancel" />
            </Button>
            <Button onClick={saveRoles} disabled={assignLoading || selectedRoleIds.size === 0}>
              {assignLoading ? (
                <FormattedMessage defaultMessage="Saving..." id="Membership Entry / Saving" />
              ) : (
                <FormattedMessage defaultMessage="Save Roles" id="Membership Entry / Save Roles" />
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
