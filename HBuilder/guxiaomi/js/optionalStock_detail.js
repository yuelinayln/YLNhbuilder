$(function(){
	$("#detail_head_list_toggle").hide();
	$("#detail_head_list_more").on('tap',function(){
		$("#detail_head_list_toggle").fadeToggle();
	});
	$("#detail_charts_head").on('tap','li',function(){
		$("#detail_charts_head li").removeClass('color_border');
		$(this).addClass('color_border');
	});
	$("#five").on('tap','.five',function(){
		$("#five .five").removeClass('color_border');
		$(this).addClass('color_border');
	});
	$("#detail_news_head").on('tap','li',function(){
		$("#detail_news_head li").removeClass('color_border');
		$(this).addClass('color_border');
	});
	
	
	
	var top=echarts.init(document.getElementById('detail_charts_top'));
	var detail_top = {
	    tooltip : {
	        trigger: 'axis'
	    },
	    grid: {
	        left: '-13%',
	        right: 0,
	        bottom: 0,
	        top:0,
	        containLabel: true
	    },
	    xAxis : [
	        {
	            type : 'category',
	            boundaryGap : false,
	            data : ['    9:30',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','11:00',
	            ' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ',' ','15:00         '],
	            splitLine: {
					show: true
	            }
	        }
	    ],
	    yAxis : [
	        {
	            type : 'value'
	        }
	    ],
	    series : [
	        {
	            name:'人次',
	            type:'line',
//	            stack: '总量',
	            label: {
	                normal: {
	                    show: false,
	                    position: 'top'
	                }
	            },
	            lineStyle: {
					normal: {
						color: '#79C1E3',
					}
				},
	            areaStyle: {
					normal: {
						color: '#CBE5F0',
					}
				},
				showSymbol: false,
	            data:[820, 932, 901, 934, 1090, 1330, 1320,
	            820, 932, 901, 934, 1290, 1330, 1320,
	            820, 932, 901, 934, 1290, 1330, 1320,
	            820, 932, 901, 934, 1290, 1330, 1320,2312,1234,820, 932, 901, 934, 1090, 1330, 1320,
	            820, 932, 901, 934, 1290, 1330, 1320,
	            820, 932, 901, 934, 1290, 1330, 1320,
	            820, 932, 901, 934, 1290, 1330, 1320,2312,1234,]
	        },
	        {
	            name:'人次',
	            type:'line',
//	            stack: '总量',
	            label: {
	                normal: {
	                    show: false,
	                    position: 'top'
	                }
	            },
	            lineStyle: {
					normal: {
						color: '#F57948',
					}
				},
				showSymbol: false,
	            data:[680, 688, 681, 684, 700, 780, 810,
	            820, 832, 831, 844, 850, 830, 850,
	            830, 832, 841, 834, 750, 720, 730,
	            720, 802, 821, 834, 850, 830, 820,852,834,680, 688, 681, 684, 700, 780, 810,
	            820, 832, 831, 844, 850, 830, 850,
	            830, 832, 841, 834, 750, 720, 730,
	            720, 802, 821, 834, 850, 830, 820,852,834,]
	        }
	    ]
	};
	top.setOption(detail_top);
	
	var bottom=echarts.init(document.getElementById('detail_charts_bottom'));
	var detail_bottom={
	    grid: {
	        left: '3%',
	        bottom:0,
	        right:0,
	        top:0
//	        containLabel: true
	    },
	    color: ["#e4393c", "#31A586"],
		xAxis: [
	        {
	            type: 'category',
	            show:false,
	            data: ['60天','59天','58天','57天','56天','55天','54天','53天','52天','51天','50天','49天','48天','47天','46天','45天','44天','43天','42天','41天','40天','39天','38天','37天','36天','35天','34天','33天','32天','31天','30天','29天','28天','27天','26天','25天','24天','23天','22天','21天','20天','19天','18天','17天','16天','15天','14天','13天','12天','11天','10天','9天','8天','7天','6天','5天','4天','3天','2天','1天',]
	        }
	    ],
	    yAxis: [
	        {
	            type: 'value',
	            axisLabel: {
	            formatter: function(data){
	            	var data=parseInt(data/100);
	            	return data
	            }
	        },
	        }
	        
	    ],
	    series: [
	        {
	            name:'16年',
	            type:'bar',
	            data:[3551.802, 4136.257, 4559.393, 5257.429, 3424.733, 3692.649, 3910.937, 4128.071, 5092.252, 9292.271, 7628.872, 4955.066, 5745.762, 7454.019, 5584.853, 6474.681, 4157.239, 1140.963, 5770.516, 6662.236, 9277.539, 4308.161, 8194.347, 3025.598, 7245.64, 6144.833, 7557.532, 3117.875, 7222.225, 1084.26, 4582.032, 5616.531, 4872.36, 2180.969, 2751.46, 3807.572, 7638.069, 2770.526, 3105.93, 2383.276, 2358.833, 2652.792, 3475.77, 3436.109, 5300.575, 6524.124, 4768.864, 5272.896, 5839.247, 6217.868, 8690.558, 1900.661, 4313.384, 7697.405, 2772.287, 3964.086, 5068.949, 1648.338, 5627.265, 5804.26]
	        },
	        {
	            name:'17年',
	            type:'bar',
	            data:[3322.494, 3452.39, 3610.984, 5823.577, 5237.974, 5627.981, 3800.603, 3724.812, 3743.68, 3733.013, 9998.011, 1663.065, 1633.057, 4639.493, 2402.539, 4418.056, 6508.711, 5829.843, 8271.181, 1820.459, 1522.969, 5996.679, 7067.692, 9254.388, 1044.257, 1566.173, 3157.306, 6933.738, 8671.483, 9329.037, 1190.788, 1250.9, 2570.118, 3319.355, 2980.489, 1766.332, 1423.335, 1441.598, 2089.245, 2824.937, 3312.156, 2218.35, 2402.72, 2995.655, 3660.913, 4334.042, 6667.541, 8099.731, 5869.456, 7051.901, 7783.052, 9069.175, 5653.473, 1462.83, 1377.841, 1468.897, 1616.782, 1592.215, 1146.593, 5408.593]
	        }
	    ]
       
	}
	bottom.setOption(detail_bottom);

	
});