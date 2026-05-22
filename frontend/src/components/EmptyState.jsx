import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {Icon && (
        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <Icon size={48} className="text-text-muted dark:text-text-muted-dark" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">{title}</h3>
      <p className="text-sm text-text-muted dark:text-text-muted-dark text-center max-w-md mb-6">
        {description}
      </p>
      {action}
    </motion.div>
  );
}
