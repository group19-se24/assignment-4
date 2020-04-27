import ContentReportForm from '@/components/ContentReport/ContentReportForm';
import render from '../../../test-utils/render';

describe('ContentReportForm', () => {
  let props = null;
  let options = {};
  let storeState = null;
  let dispatchMock = null;
  let commitMock = null;

  beforeEach(() => {
    props = {
      imageId: 1,
      imageURL: 'http://foo.bar',
    };

    dispatchMock = jest.fn();
    commitMock = jest.fn();

    storeState = {
      $store: {
        dispatch: dispatchMock,
        commit: commitMock,
        state: {
          isReportSent: false,
          reportFailed: false,
        },
      },
    };

    options = {
      propsData: props,
      mocks: {
        ...storeState,
      },
    };
  });

  it('should contain the correct contents', () => {
    const wrapper = render(ContentReportForm, options);
    expect(wrapper.find('.report-form').element).toBeDefined();
  });

  it('should render report sent', () => {
    storeState.$store.state.isReportSent = true;
    const wrapper = render(ContentReportForm, options);
    expect(wrapper.find({ name: 'done-message' }).vm).toBeDefined();
  });

  it('should render error message', () => {
    storeState.$store.state.reportFailed = true;
    const wrapper = render(ContentReportForm, options);
    expect(wrapper.find({ name: 'report-error' }).vm).toBeDefined();
  });

  it('should render error message', () => {
    storeState.$store.state.isReportSent = true;
    const wrapper = render(ContentReportForm, options);
    wrapper.setData({ selectedCopyright: true, isReportSent: true });
    expect(wrapper.find({ name: 'dcma-notice' }).vm).toBeDefined();
  });

  it('should render other type form', () => {
    const wrapper = render(ContentReportForm, options);
    wrapper.setData({ selectedOther: true });
    expect(wrapper.find('.other-form').element).toBeDefined();
  });

  it('should navigate to other form', () => {
    const wrapper = render(ContentReportForm, options);
    const radio = wrapper.find('#other');
    radio.setChecked();

    const button = wrapper.find('.next-button');
    button.trigger('click');
    expect(wrapper.find('.other-form').element).toBeDefined();
  });

  it('should dispatch SEND_CONTENT_REPORT on next when dcma is selected', () => {
    const wrapper = render(ContentReportForm, options);
    const radio = wrapper.find('#dcma');
    radio.setChecked();

    const button = wrapper.find('.next-button');
    button.trigger('click');
    expect(dispatchMock).toHaveBeenCalledWith('SEND_CONTENT_REPORT', {
      identifier: props.imageId,
      reason: 'dcma',
      description: '',
    });
  });

  it('should dispatch SEND_CONTENT_REPORT on next when mature is selected', () => {
    const wrapper = render(ContentReportForm, options);
    const radio = wrapper.find('#adult');
    radio.setChecked();

    const button = wrapper.find('.next-button');
    button.trigger('click');
    expect(dispatchMock).toHaveBeenCalledWith('SEND_CONTENT_REPORT', {
      identifier: props.imageId,
      reason: 'adult',
      description: '',
    });
  });

  it('should dispatch SEND_CONTENT_REPORT on other form submit', () => {
    const wrapper = render(ContentReportForm, options);
    const radio = wrapper.find('#other');
    radio.setChecked();
    wrapper.setData({ selectedOther: true });

    const textarea = wrapper.find('.reason');
    const description = 'foo bar';
    textarea.setValue(description);

    const button = wrapper.find('.submit-other-button');
    button.trigger('click');
    expect(dispatchMock).toHaveBeenCalledWith('SEND_CONTENT_REPORT', {
      identifier: props.imageId,
      reason: 'other',
      description,
    });
  });

  it('should close form', () => {
    const wrapper = render(ContentReportForm, options);

    const button = wrapper.find('.close-button');
    button.trigger('click');
    expect(commitMock).toHaveBeenCalledWith('REPORT_FORM_CLOSED');
  });
});
