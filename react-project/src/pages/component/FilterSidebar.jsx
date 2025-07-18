import React from 'react';
import './FilterSidebar.css';

const FilterSidebar = () => {
  return (
    <aside className="filter-sidebar">
      <h4 className="filter-title">Filter & Refine</h4>
      <div className="filter-section">
        <div className="filter-label">Category</div>
        <ul className="filter-list">
          <li><input type="radio" name="category" defaultChecked /> All categories</li>
          <li className="filter-sub">eCommerce
            <ul>
              <li><input type="checkbox" /> Shopify</li>
              <li><input type="checkbox" /> OpenCart</li>
              <li><input type="checkbox" /> BigCommerce</li>
            </ul>
          </li>
        </ul>
      </div>
      <div className="filter-section">
        <div className="filter-label">Price</div>
        <div className="filter-price-range">
          <input type="number" min="0" placeholder="$ 0" className="filter-price-input" />
          <span className="filter-price-sep">-</span>
          <input type="number" min="0" placeholder="$ 110" className="filter-price-input" />
          <button className="filter-price-btn">→</button>
        </div>
      </div>
      <div className="filter-section">
        <label><input type="checkbox" /> On Sale</label>
      </div>
      <div className="filter-section">
        <div className="filter-label">Sales</div>
        <ul className="filter-list">
          <li><input type="checkbox" /> No Sales</li>
          <li><input type="checkbox" /> Low</li>
          <li><input type="checkbox" /> Medium</li>
          <li><input type="checkbox" /> High</li>
          <li><input type="checkbox" /> Top Sellers</li>
        </ul>
      </div>
      <div className="filter-section">
        <div className="filter-label">Rating</div>
        <ul className="filter-list">
          <li><input type="radio" name="rating" defaultChecked /> Show all</li>
          <li><input type="radio" name="rating" /> 1 star and higher</li>
          <li><input type="radio" name="rating" /> 2 stars and higher</li>
          <li><input type="radio" name="rating" /> 3 stars and higher</li>
          <li><input type="radio" name="rating" /> 4 stars and higher</li>
        </ul>
      </div>
      <div className="filter-section">
        <div className="filter-label">Date Added</div>
        <ul className="filter-list">
          <li><input type="radio" name="date" defaultChecked /> Any date</li>
        </ul>
      </div>
      <div className="filter-section">
        <div className="filter-label">Software Version</div>
        <ul className="filter-list">
          <li><input type="checkbox" /> Shopify</li>
          <li><input type="checkbox" /> OpenCart</li>
          <li><input type="checkbox" /> BigCommerce</li>
        </ul>
      </div>
      <div className="filter-section">
        <div className="filter-label">Compatible With</div>
        <ul className="filter-list">
          <li><input type="checkbox" /> Bootstrap</li>
          <li><input type="checkbox" /> Foundation</li>
        </ul>
      </div>
    </aside>
  );
};

export default FilterSidebar; 