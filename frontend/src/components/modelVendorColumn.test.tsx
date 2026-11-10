// @vitest-environment jsdom
// 逐模型厂商图标、占位与服务列说明；保留通用徽章测试。
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { describe, it, expect, beforeAll } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n';
import { StatusTable } from './StatusTable';
import { VendorBadge } from './VendorBadge';
import type { ProcessedMonitorData } from '../types';

function monitor(overrides: Partial<ProcessedMonitorData>): ProcessedMonitorData {
  return {
    id: 'acme-cc-vip',
    providerId: 'acme',
    providerSlug: 'acme',
    providerName: 'Acme',
    serviceType: 'cc',
    serviceName: 'cc',
    category: 'commercial',
    sponsor: '',
    board: 'hot',
    intervalMs: 60000,
    history: [],
    currentStatus: 'AVAILABLE',
    uptime: 99,
    lastCheckLatency: 100,
    isMultiModel: false,
    channel: 'O-Max',
    modelEntries: [{ model: 'GLM-4.7', requestModel: 'glm-4.7' }],
    ...overrides,
  };
}

function renderTable(data: ProcessedMonitorData[], hasVendorData: boolean): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(
      <I18nextProvider i18n={i18n}>
        <StatusTable
          data={data}
          sortConfig={{ key: 'uptime', direction: 'desc' }}
          timeRange="24h"
          slowLatencyMs={5000}
          isFavorite={() => false}
          onToggleFavorite={() => {}}
          onSort={() => {}}
          onBlockHover={() => {}}
          onBlockLeave={() => {}}
          rpdiagEnabled={false}
          hasVendorData={hasVendorData}
        />
      </I18nextProvider>,
    );
  });
  return container;
}

beforeAll(async () => {
  // 断言的是中文文案，固定语言避免受运行环境语言检测影响
  await i18n.changeLanguage('zh-CN');
  // jsdom 没有 matchMedia；恒 false = 桌面端断点，本用例断言的正是桌面表格结构
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

describe('Sakrylle 隐藏模型列', () => {
  it('桌面表格不渲染模型列，因此也不渲染逐模型厂商图标', () => {
    const container = renderTable([monitor({ modelVendors: ['zhipu', 'deepseek'], modelEntries: [
      { model: 'GLM', requestModel: 'glm-5.3', vendor: 'zhipu' },
      { model: 'DeepSeek', requestModel: 'deepseek-v4-pro', vendor: 'deepseek' },
    ] })], true);
    const headers = Array.from(container.querySelectorAll('thead th'));
    expect(headers.some(th => th.textContent?.includes('模型'))).toBe(false);
    expect(headers.some(th => th.textContent?.includes('价格'))).toBe(false);
    expect(headers.some(th => th.textContent?.includes('上架'))).toBe(false);
    expect(container.querySelector('tbody [data-model-vendor]')).toBeNull();
    expect(container.querySelectorAll('colgroup col').length).toBe(container.querySelectorAll('thead th').length);
    expect(container.querySelectorAll('tbody td').length).toBe(container.querySelectorAll('thead th').length);
  });

  it('hasVendorData 仍只门控服务列说明', () => {
    const item = monitor({ modelVendors: ['zhipu'], modelEntries: [
      { model: 'GLM', requestModel: 'glm-5.3', vendor: 'zhipu' },
    ] });
    for (const hasVendorData of [false, true]) {
      const container = renderTable([item], hasVendorData);
      const service = container.querySelectorAll('thead th')[1];
      expect(service.querySelector('.lucide-info') !== null).toBe(hasVendorData);
      expect(container.querySelector('tbody [aria-label="智谱"]')).toBeNull();
    }
  });
});

// iconOnly（移动端卡片）：只出图标不出文字，全名走 title/aria-label；
// 未收录 code 没图标，必须退回文字，否则那条通道会彻底没有厂商信号。
describe('VendorBadge iconOnly', () => {
  function renderBadge(vendor: string) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(
        <I18nextProvider i18n={i18n}>
          <VendorBadge vendor={vendor} compact iconOnly />
        </I18nextProvider>,
      );
    });
    return container;
  }

  it('已收录厂商：出图标、不出文字、aria-label 带全名', () => {
    const container = renderBadge('zhipu');
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.textContent).toBe('');
    expect(container.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe('智谱');
  });

  it('未收录 code：无图标时退回文字', () => {
    const container = renderBadge('brandnew');
    expect(container.querySelector('svg')).toBeNull();
    expect(container.textContent).toBe('brandnew');
  });
});
