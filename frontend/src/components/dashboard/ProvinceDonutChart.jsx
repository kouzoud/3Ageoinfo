import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { MapPin } from 'lucide-react';

/**
 * Graphique en anneau (donut) pour la répartition par province
 * Design identique à DonutChartCard mais pour les provinces
 */
const ProvinceDonutChart = ({ data = [], title = "Répartition par Province" }) => {
    // Couleurs par défaut pour les provinces
    const COLORS = [
        '#3b82f6', // Bleu
        '#10b981', // Vert
        '#8b5cf6', // Violet
        '#f59e0b', // Orange
        '#ec4899', // Rose
        '#06b6d4', // Cyan
        '#ef4444', // Rouge
        '#84cc16'  // Lime
    ];

    // Données par défaut
    const defaultData = [
        { name: 'Casablanca', value: 45, color: '#3b82f6' },
        { name: 'Rabat', value: 32, color: '#10b981' },
        { name: 'Marrakech', value: 28, color: '#8b5cf6' },
        { name: 'Tanger', value: 15, color: '#f59e0b' },
        { name: 'Fès', value: 12, color: '#ec4899' }
    ];

    const chartData = data.length > 0 ? data : defaultData;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(8px)',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                        border: '1px solid #e2e8f0'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                            style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '4px',
                                background: data.color || data.fill
                            }}
                        />
                        <span style={{ fontWeight: '600', color: '#1e293b' }}>{data.name}</span>
                    </div>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '16px' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Incidents</span>
                            <p style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{data.value}</p>
                        </div>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Part</span>
                            <p style={{ fontWeight: '700', color: '#1e293b', margin: 0 }}>{percentage}%</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div
            style={{
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
                height: '100%'
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px'
                }}
            >
                <div
                    style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <MapPin size={20} color="#fff" />
                </div>
                <h3
                    style={{
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        color: '#1e293b',
                        margin: 0
                    }}
                >
                    {title}
                </h3>
            </div>

            {/* Chart with Center Label */}
            <div style={{ position: 'relative', height: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {chartData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                    style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                    }}
                >
                    <div
                        style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: '#1e293b',
                            lineHeight: 1
                        }}
                    >
                        {total}
                    </div>
                    <div
                        style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            marginTop: '4px'
                        }}
                    >
                        Total
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px',
                    marginTop: '16px'
                }}
            >
                {chartData.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#f8fafc';
                        }}
                    >
                        <div
                            style={{
                                width: '10px',
                                height: '10px',
                                borderRadius: '3px',
                                background: item.color || COLORS[index % COLORS.length],
                                flexShrink: 0
                            }}
                        />
                        <span
                            style={{
                                fontSize: '0.8rem',
                                color: '#64748b',
                                flex: 1,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {item.name}
                        </span>
                        <span
                            style={{
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#1e293b'
                            }}
                        >
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProvinceDonutChart;
