$(function() {
	console.log('load jquery');

	/*
	 * Show characteristics
	 */
	$('.service').on('change', function() {
		var that = $(this);
		$(".service option").each(function() {
			var opt = $(this).text();
			that.nextAll().find('div.characteristic-'+opt).addClass('hidden');
		});
		var selected = $(this).find("option:selected").text();
		$(this).nextAll().find('div.characteristic-'+selected).removeClass('hidden');
	});

	$('a[name="characteristic"].add').on('click', addCharacteristic)

	$('a[name="submit"]').on('click', post);

	/*
	 * Post config data
	 */
	function post() {
		var device = {accessories:[], platforms:[]};
		var i = 0;
		$('.device').each(function() {
			var plugin = $(this).find('input.plugin').val();
			var characteristic = $(this).find('.characteristic').not('.hidden');

			if(characteristic) {
				var arr = {};  //new Array();
				characteristic.find('input').each(function() {
					var key = $(this).data('name');
					if($(this).val() != "undefined" && $(this).val() != "") {
						if($(this).prev('select').children('option:selected').val() && key != 'Name') {
							arr[key] = {};
							arr[key]['command'] = $(this).val();
							arr[key]['behavior'] = $(this).prev('select').children('option:selected').val();
						} else {
							console.log(key + ':' + $(this).val());
							arr[key] = $(this).val();
						}
					}
				});
				arr['accessory'] = plugin;
				arr['service'] = $(this).children('select[name="service"]').children('option:selected').val();
				var type = $(this).find('select[name="device"]').children('option:selected').val();
				
				var size = 0;
				for(var a in arr) size++;
				if(size > 0 && arr['service'] && arr['service'] != "undefined") {
					if(type == 'accessory') {
						device['accessories'].push(arr);
					} else if(type == 'platform') {
						device['platforms'].push(arr);
					}
				}
				i++;
			}
		});
		
		$.ajax({
			type: 'post',
			url: '/submit',
			data: JSON.stringify(device),
			contentType: 'application/json',
			success: function(result) {
				console.log('success');
				document.location.href = '/submit';
			}
		});
	}

	function addCharacteristic() {
		var elem = $(this).parent().nextAll('select.characteristic').not('.hidden');
		
		$(this).closest('.char-box').append(elem.eq(0).clone(true));
		$(this).closest('.char-box').append(elem.eq(0).clone(true));
	}
});
