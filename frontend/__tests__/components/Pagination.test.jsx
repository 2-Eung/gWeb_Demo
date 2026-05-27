import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Pagination from '../../src/components/Pagination'

describe('Pagination Component', () => {
  it('should render null when totalPages is 0 or 1', () => {
    const { container } = render(
      <Pagination currentPage={0} totalPages={1} onPageChange={() => {}} />
    )
    expect(container.firstChild).toBeNull()

    const { container: containerEmpty } = render(
      <Pagination currentPage={0} totalPages={0} onPageChange={() => {}} />
    )
    expect(containerEmpty.firstChild).toBeNull()
  })

  it('should render correct number of pages and next/prev buttons', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={0} totalPages={3} onPageChange={onPageChange} />)

    expect(screen.getByText('이전')).toBeDefined()
    expect(screen.getByText('다음')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('2')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
  })

  it('should disable prev button on first page and next button on last page', () => {
    const { rerender } = render(
      <Pagination currentPage={0} totalPages={3} onPageChange={() => {}} />
    )
    expect(screen.getByText('이전')).toBeDisabled()
    expect(screen.getByText('다음')).not.toBeDisabled()

    rerender(<Pagination currentPage={2} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByText('이전')).not.toBeDisabled()
    expect(screen.getByText('다음')).toBeDisabled()
  })

  it('should call onPageChange with correct values when buttons are clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination currentPage={1} totalPages={3} onPageChange={onPageChange} />)

    // Click Prev
    fireEvent.click(screen.getByText('이전'))
    expect(onPageChange).toHaveBeenLastCalledWith(0)

    // Click Next
    fireEvent.click(screen.getByText('다음'))
    expect(onPageChange).toHaveBeenLastCalledWith(2)

    // Click specific page
    fireEvent.click(screen.getByText('3'))
    expect(onPageChange).toHaveBeenLastCalledWith(2)
  })
})
