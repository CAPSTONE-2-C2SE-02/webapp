import { useInView } from 'react-intersection-observer';

interface InfiniteScrollContainerProps extends React.PropsWithChildren {
  onBottomReached: () => void;
  className?: string;
}

const InfiniteScrollContainer = ({
  children,
  onBottomReached,
  className
}: InfiniteScrollContainerProps) => {
  const { ref } = useInView({
    rootMargin: '160px',
    onChange: (inView) => {
      if (inView) {
        onBottomReached();
      }
    }
  })

  return (
    <div className={className}>
      {children}
      <div ref={ref} />
    </div>
  )
}

export default InfiniteScrollContainer