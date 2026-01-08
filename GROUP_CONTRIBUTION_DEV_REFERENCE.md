# Group Contribution - Developer Quick Reference

## Files Created/Modified

### Frontend
- **Page**: `app/group-contribution/page.tsx` - Main group contribution page (650+ lines)
- **Hook**: `hooks/use-groups.ts` - Group management hook with API integration
- **Updated**: `components/sidebar.tsx` - Added "Group Contribution" navigation link

### API Routes
- `app/api/groups/route.ts` - Create group, fetch all groups
- `app/api/groups/[groupId]/route.ts` - Get, update, delete group
- `app/api/groups/[groupId]/join/route.ts` - Join group via referral
- `app/api/groups/[groupId]/contribute/route.ts` - Contribute & fetch transactions

## Key Interfaces

```typescript
// Group Data
interface Group {
  id: string
  name: string
  purpose: string
  contributionAmount: number
  frequency: 'daily' | 'weekly' | 'monthly'
  referralCode: string
  referralLink: string
  members: GroupMember[]
  balance: number
  totalContributed: number
  createdAt: string
}

// Group Member
interface GroupMember {
  id: string
  name: string
  email: string
  contributionAmount: number
  totalContributed: number
  referredBy?: string
  joinedAt?: string
}

// Transaction
interface Transaction {
  id: string
  memberId: string
  memberName: string
  amount: number
  date: string
  description: string
}
```

## Usage Examples

### Import Hook
```typescript
import { useGroups } from '@/hooks/use-groups'

function MyComponent() {
  const {
    groups,
    loading,
    error,
    createGroup,
    joinGroup,
    contributeToGroup,
    getGroupTransactions,
    fetchGroups,
  } = useGroups()

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups()
  }, [fetchGroups])

  // Create group
  const handleCreate = async () => {
    const group = await createGroup({
      groupName: 'Friends',
      purpose: 'Save together',
      contributionAmount: '27.40',
      frequency: 'weekly',
    })
  }

  // Join group
  const handleJoin = async () => {
    const group = await joinGroup('FC2024', 'John Doe')
  }

  // Contribute
  const handleContribute = async () => {
    const transaction = await contributeToGroup('group-1', 27.40, 'Weekly save')
  }

  // Get transactions
  const handleGetTransactions = async () => {
    const transactions = await getGroupTransactions('group-1')
  }
}
```

## API Endpoints

### Create Group
```
POST /api/groups
Content-Type: application/json
Authorization: Bearer <token>

{
  "groupName": "Friends Circle",
  "purpose": "Vacation fund",
  "contributionAmount": "27.40",
  "frequency": "weekly"
}

Response (201):
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "id": "group-xxx",
    "referralCode": "FC2024",
    "referralLink": "https://save2740.app/join/FC2024",
    ...
  }
}
```

### Make Contribution
```
POST /api/groups/[groupId]/contribute
Content-Type: application/json
Authorization: Bearer <token>

{
  "memberId": "member-1",
  "amount": "27.40",
  "description": "Weekly contribution"
}

Response (201):
{
  "success": true,
  "message": "Contribution recorded successfully",
  "data": {
    "transaction": {
      "id": "txn-xxx",
      "amount": 27.40,
      "status": "completed"
    },
    "walletUpdate": {
      "newBalance": 1027.40,
      "transactionId": "txn-xxx"
    }
  }
}
```

### Join Group
```
POST /api/groups/[groupId]/join
Content-Type: application/json
Authorization: Bearer <token>

{
  "referralCode": "FC2024",
  "referredBy": "John Doe"
}

Response (201):
{
  "success": true,
  "message": "Successfully joined group",
  "data": {
    "groupId": "group-xxx",
    "member": {
      "id": "member-xxx",
      "referredBy": "John Doe"
    }
  }
}
```

## Page Features

### Create Group
- [ ] Enter group name and purpose
- [ ] Set contribution amount
- [ ] Select frequency (daily/weekly/monthly)
- [ ] Submit form
- [ ] Get referral code and link

### View Groups
- [ ] See all user's groups
- [ ] Display member count, balance, total
- [ ] Quick access to group details
- [ ] Click to manage group

### Manage Group
- [ ] View all members with contribution tracking
- [ ] Add members via referral code
- [ ] Copy referral link
- [ ] Make contributions
- [ ] View transaction history
- [ ] Real-time updates

### Referral System
- [ ] Generate unique code per group
- [ ] Share referral link
- [ ] Track referral source
- [ ] Display who referred each member

## Integration Checklist

- [x] Frontend page structure
- [x] API routes structure
- [x] Hook for state management
- [x] Sidebar navigation
- [x] Mock data implementation
- [ ] Database integration (MongoDB/Prisma)
- [ ] Wallet service integration
- [ ] Real-time updates (WebSocket)
- [ ] Email notifications
- [ ] Payout automation
- [ ] Fraud detection

## Testing Scenarios

1. **Create Group**
   - User creates group with all fields
   - Verify referral code generated
   - Verify user added as first member

2. **Join Group**
   - User joins with valid referral code
   - Verify member added to group
   - Verify referral source tracked

3. **Contribute**
   - Member makes contribution
   - Verify transaction created
   - Verify balance updated
   - Verify wallet updated

4. **View Transactions**
   - Load transaction history
   - Verify all contributions listed
   - Verify timestamps correct

## Debug Tips

1. Check console for API errors
2. Verify authentication token in headers
3. Check referral code formatting (uppercase)
4. Verify contribution amount > 0
5. Check group member list updates
6. Verify transaction timestamps in UTC

## Performance Optimization

- Memoize group list queries
- Use pagination for large transaction lists
- Debounce contribution form submissions
- Cache referral code validation
- Optimize real-time updates to 2-3 second intervals

## Security Notes

- All endpoints require Bearer token authentication
- Validate all numeric inputs
- Verify user ownership of groups before updates/deletes
- Sanitize text inputs (group name, purpose, description)
- Rate limit contribution submissions
- Verify referral code matches group before joining
