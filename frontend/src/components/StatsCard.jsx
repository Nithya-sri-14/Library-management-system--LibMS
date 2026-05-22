import { motion } from 'framer-motion';

export default function StatsCard({ title, value, icon: Icon, color = 'primary', subtitle, loading }) {
  const colors = {
    primary: 'from-primary to-primary-light',
    accent: 'from-accent to-accent-light',
    warm: 'from-amber-500 to-orange-500',
    cool: 'from-blue-500 to-purple-500',
    rose: 'from-rose-500 to-pink-500',
  };

  if (loading) {
    return (
      <div className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark">
        <div className="skeleton h-4 w-24 mb-3" />
        <div className="skeleton h-8 w-16 mb-2" />
        <div className="skeleton h-3 w-32" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card dark:bg-card-dark rounded-xl p-6 border border-border dark:border-border-dark card-hover relative overflow-hidden"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-muted dark:text-text-muted-dark font-medium">{title}</p>
          <p className="text-3xl font-bold text-text dark:text-text-dark mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-text-muted dark:text-text-muted-dark mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg bg-gradient-to-br ${colors[color] || colors.primary} text-white`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors[color] || colors.primary} opacity-50`} />
    </motion.div>
  );
}
