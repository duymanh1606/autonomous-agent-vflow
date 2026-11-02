# Good Example — TDD Cycle cho T-003: Product Repository

## Context
- Task: Tạo ProductRepository với parameterized SQL
- REQ: REQ-U01 (parameterized queries), REQ-E05 (soft delete)
- Test cases: TC-01 (parameterized), TC-09 (soft delete)

## 🔴 RED — Viết test trước

```javascript
// test/repositories/product.repo.test.js
const { ProductRepository } = require('../../repositories/product.repo');

describe('ProductRepository', () => {
  let repo, mockPool;

  beforeEach(() => {
    mockPool = { query: jest.fn() };
    repo = new ProductRepository(mockPool);
  });

  // TC-01: REQ-U01 — parameterized query
  it('should_use_parameterized_query_when_finding_by_id', async () => {
    mockPool.query.mockResolvedValue({ rows: [{ id: 1, name: 'Test' }] });
    
    await repo.findById(1);
    
    // Assert: query uses $1 parameter, NOT string concat
    const [sql, params] = mockPool.query.mock.calls[0];
    expect(sql).toContain('$1');
    expect(sql).not.toMatch(/['"]?\s*\+/); // no string concat
    expect(params).toEqual([1]);
  });

  // TC-09: REQ-E05 — soft delete
  it('should_set_deleted_at_when_soft_deleting', async () => {
    mockPool.query.mockResolvedValue({ rowCount: 1 });
    
    await repo.softDelete(1);
    
    const [sql] = mockPool.query.mock.calls[0];
    expect(sql).toContain('deleted_at');
    expect(sql).not.toContain('DELETE FROM');
  });
});
```

**Run → FAIL**: `ProductRepository is not defined` ✅ (expected)

## 🟢 GREEN — Code tối thiểu

```javascript
// repositories/product.repo.js
class ProductRepository {
  constructor(pool) { this.pool = pool; }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL', [id]
    );
    return rows[0] || null;
  }

  async softDelete(id) {
    const { rowCount } = await this.pool.query(
      'UPDATE products SET deleted_at = NOW() WHERE id = $1', [id]
    );
    return rowCount > 0;
  }
}
module.exports = { ProductRepository };
```

**Run → PASS** ✅

## 🔵 REFACTOR — Clean theo constitution

- Extracted SQL strings to constants
- Added JSDoc comments
- Verified: all tests still pass ✅
- No-Go check: không đụng `db/pool.js` ✅
