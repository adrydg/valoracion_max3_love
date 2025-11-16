'use client'

import React, { useEffect, useState } from 'react'

interface Stats {
  totalCalls: number
  callsWithRegistradores: number
  callsWithoutRegistradores: number
  tokensSaved: number
  totalValuations: number
  percentageWithJSON: string
  percentageWithoutJSON: string
  estimatedCostSaved: string
}

interface ValuationHistoryEntry {
  id: string
  timestamp: string
  property: any
  marketData: any
  valuation: any
  usedJSON: boolean
  calledClaude: boolean
  precioRegistradores: number | null
  tokensUsed: number
  prompt?: string
  duration: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [history, setHistory] = useState<ValuationHistoryEntry[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/analytics/valuation')
      const data = await res.json()
      setStats(data.stats)
      setHistory(data.history || [])
      setLoading(false)
    } catch (error) {
      console.error('Error fetching stats:', error)
      setLoading(false)
    }
  }

  const resetStats = async () => {
    if (confirm('¿Estás seguro de resetear las estadísticas?')) {
      await fetch('/api/analytics/valuation', { method: 'DELETE' })
      fetchStats()
    }
  }

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Auto-refresh cada 5s
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando estadísticas...</div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error al cargar estadísticas</div>
      </div>
    )
  }

  const percentageValue = parseFloat(stats.percentageWithJSON.replace('%', ''))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics de Valoración</h1>
            <p className="text-gray-600">Monitorización del sistema modular JSON → Claude</p>
          </div>
          <button
            onClick={resetStats}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Resetear Stats
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Valoraciones */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">TOTAL VALORACIONES</div>
            <div className="text-4xl font-bold text-gray-900">{stats.totalValuations}</div>
          </div>

          {/* Uso de JSON */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">USO DE JSON</div>
            <div className="text-4xl font-bold text-green-600">{stats.percentageWithJSON}</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.callsWithRegistradores} valoraciones
            </div>
          </div>

          {/* Llamadas a Claude */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">LLAMADAS A CLAUDE</div>
            <div className="text-4xl font-bold text-orange-600">{stats.percentageWithoutJSON}</div>
            <div className="text-sm text-gray-500 mt-1">
              {stats.callsWithoutRegistradores} valoraciones
            </div>
          </div>

          {/* Tokens Ahorrados */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="text-sm font-semibold text-gray-600 mb-2">TOKENS AHORRADOS</div>
            <div className="text-4xl font-bold text-purple-600">
              {stats.tokensSaved.toLocaleString()}
            </div>
            <div className="text-sm text-green-600 font-semibold mt-1">
              {stats.estimatedCostSaved}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Distribución de Rutas</h2>
          <div className="relative h-12 bg-gray-200 rounded-lg overflow-hidden">
            <div
              className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center text-white font-bold transition-all duration-500"
              style={{ width: stats.percentageWithJSON }}
            >
              {percentageValue > 10 && `JSON ${stats.percentageWithJSON}`}
            </div>
            <div
              className="absolute h-full bg-gradient-to-r from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold transition-all duration-500"
              style={{
                width: stats.percentageWithoutJSON,
                left: stats.percentageWithJSON,
              }}
            >
              {parseFloat(stats.percentageWithoutJSON.replace('%', '')) > 10 &&
                `Claude ${stats.percentageWithoutJSON}`}
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              Precio en JSON (Sin llamar a Claude)
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-500 rounded mr-2"></div>
              Consultó a Claude API
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Eficiencia */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Eficiencia del Sistema</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Valoraciones con JSON:</span>
                <span className="font-bold text-green-600">{stats.callsWithRegistradores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Valoraciones con Claude:</span>
                <span className="font-bold text-orange-600">{stats.callsWithoutRegistradores}</span>
              </div>
              <div className="flex justify-between pt-3 border-t">
                <span className="text-gray-600">Tokens ahorrados:</span>
                <span className="font-bold text-purple-600">
                  {stats.tokensSaved.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Coste evitado:</span>
                <span className="font-bold text-green-600">{stats.estimatedCostSaved}</span>
              </div>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recomendaciones</h3>
            <div className="space-y-3 text-sm">
              {percentageValue >= 90 && (
                <div className="p-3 bg-green-50 border-l-4 border-green-500 text-green-800">
                  ✅ Excelente: {stats.percentageWithJSON} de cobertura JSON
                </div>
              )}
              {percentageValue < 90 && percentageValue >= 80 && (
                <div className="p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800">
                  ⚠️ Bueno: Considera añadir más CPs al JSON
                </div>
              )}
              {percentageValue < 80 && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-800">
                  🚨 Atención: Bajo uso de JSON. Revisar precios_por_cp.json
                </div>
              )}
              <div className="p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800">
                💡 Sistema funcionando: Prioridad JSON → Claude
              </div>
              <div className="p-3 bg-purple-50 border-l-4 border-purple-500 text-purple-800">
                📊 Auto-refresh: Estadísticas actualizadas cada 5 segundos
              </div>
            </div>
          </div>
        </div>

        {/* Historial de Valoraciones */}
        <div className="mt-8 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-indigo-500 to-blue-500">
            <h2 className="text-2xl font-bold text-white">Historial de Valoraciones</h2>
            <p className="text-indigo-100 mt-1">
              Últimas {history.length} valoraciones (máximo 100)
            </p>
          </div>

          {history.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay valoraciones en el historial todavía
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fecha/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Código Postal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Superficie
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Valoración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fuente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <tr
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(entry.timestamp).toLocaleString('es-ES')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {entry.property.postalCode}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {entry.property.squareMeters} m²
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                          {entry.valuation.avg.toLocaleString()}€
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {entry.usedJSON ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              JSON
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              Claude
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {entry.duration}ms
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                            onClick={(e) => {
                              e.stopPropagation()
                              setExpandedId(expandedId === entry.id ? null : entry.id)
                            }}
                          >
                            {expandedId === entry.id ? '▼ Ocultar' : '▶ Ver detalles'}
                          </button>
                        </td>
                      </tr>
                      {expandedId === entry.id && (
                        <tr key={`${entry.id}-details`}>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Datos de la propiedad */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Datos de la Propiedad
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">CP:</span>{' '}
                                    <span className="font-medium">{entry.property.postalCode}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Municipio:</span>{' '}
                                    <span className="font-medium">{entry.property.municipality}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Superficie:</span>{' '}
                                    <span className="font-medium">{entry.property.squareMeters} m²</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Habitaciones:</span>{' '}
                                    <span className="font-medium">{entry.property.bedrooms}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Baños:</span>{' '}
                                    <span className="font-medium">{entry.property.bathrooms || 'N/A'}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Tipo:</span>{' '}
                                    <span className="font-medium">{entry.property.propertyType || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Datos de mercado */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Datos de Mercado
                                </h4>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Precio medio:</span>{' '}
                                    <span className="font-medium">{entry.marketData.precio_medio_m2}€/m²</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Fuente:</span>{' '}
                                    <span className="font-medium">{entry.marketData.fuente}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Tendencia:</span>{' '}
                                    <span className="font-medium">{entry.marketData.tendencia}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Resultado de valoración */}
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3">
                                  Resultado de Valoración
                                </h4>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Mínimo:</span>{' '}
                                    <span className="font-bold text-green-600">
                                      {entry.valuation.min.toLocaleString()}€
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Medio:</span>{' '}
                                    <span className="font-bold text-blue-600">
                                      {entry.valuation.avg.toLocaleString()}€
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Máximo:</span>{' '}
                                    <span className="font-bold text-orange-600">
                                      {entry.valuation.max.toLocaleString()}€
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Precio/m²:</span>{' '}
                                    <span className="font-medium">
                                      {entry.valuation.pricePerM2.toLocaleString()}€
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Prompt de Claude (si existe) */}
                              {entry.prompt && (
                                <div className="bg-white p-4 rounded-lg border border-orange-200">
                                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                    <span className="mr-2">Prompt enviado a Claude</span>
                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                      {entry.tokensUsed} tokens
                                    </span>
                                  </h4>
                                  <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                                    {entry.prompt}
                                  </pre>
                                </div>
                              )}

                              {/* Info técnica */}
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <div>ID: {entry.id}</div>
                                <div>
                                  Usado JSON: {entry.usedJSON ? 'Sí' : 'No'} | Llamó a Claude:{' '}
                                  {entry.calledClaude ? 'Sí' : 'No'} | Tokens: {entry.tokensUsed}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Sistema modular de valoración | Prioridad absoluta a JSON de Registradores
          </p>
          <p className="mt-1">
            Documentación completa: <code className="bg-gray-200 px-2 py-1 rounded">/MONITORIZACION.md</code>
          </p>
        </div>
      </div>
    </div>
  )
}
