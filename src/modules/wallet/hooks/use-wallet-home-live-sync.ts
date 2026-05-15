import { useCallback, useMemo, useState } from "react"
import { useWalletRealtime } from "../../../shared/realtime/use-wallet-realtime"
import { getFinancialDashboard } from "../../../shared/api/financial-api"

export function useWalletHomeLiveSync(params: {
  userId?: string
  walletId?: string
  enabled?: boolean
}) {
  const [walletSyncTick, setWalletSyncTick] = useState(0)
  const [loading, setLoading] = useState(false)
  const [dashboard, setDashboard] = useState<Awaited<
    ReturnType<typeof getFinancialDashboard>
  > | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!params.userId && !params.walletId) return

    try {
      setLoading(true)
      setError(null)
      setWalletSyncTick((value) => value + 1)

      const result = await getFinancialDashboard({
        userId: params.userId,
        walletId: params.walletId,
        historyLimit: 8,
      })

      setDashboard(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "wallet_dashboard_refresh_failed")
    } finally {
      setLoading(false)
    }
  }, [params.userId, params.walletId])

  useWalletRealtime({
    userId: params.userId,
    walletId: params.walletId,
    enabled: params.enabled,
    onRefresh: refresh,
  })

  const quickStats = useMemo(() => {
    if (!dashboard) return null

    return {
      totalBalance: dashboard.overview.totals.totalBalance,
      walletCount: dashboard.overview.totals.walletCount,
      paymentCount: dashboard.overview.totals.paymentCount,
      p2pCount: dashboard.overview.totals.p2pCount,
      qrCount: dashboard.overview.totals.qrCount,
    }
  }, [dashboard])

  return {
    walletSyncTick,
    loading,
    error,
    dashboard,
    quickStats,
    refreshWalletHomeRealtime: refresh,
  }
}
