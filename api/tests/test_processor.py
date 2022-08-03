from plot.processor import Processor


def test_initialise_processor():
    processor = Processor()
    assert processor.initial_data == []
    data = processor.process('')
    assert data == {}
