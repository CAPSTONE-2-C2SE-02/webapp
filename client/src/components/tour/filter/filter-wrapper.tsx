interface FilterWrapperProps {
  children: React.ReactNode;
  title?: string;
}

const FilterWrapper = ({ children, title }: FilterWrapperProps) => {
  return (
    <div className="px-4 pt-4 pb-5 border border-slate-200 bg-white rounded-lg flex flex-col gap-3">
      {title && <p className="text-base font-medium text-primary">{title}</p>}
      {children}
    </div>
  )
}

export default FilterWrapper