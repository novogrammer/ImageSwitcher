(function () {
    function switchImage(img, switcherList) {
        switcherList.forEach(function (switcher) {
            if (img.src.startsWith(switcher.from)) {
                img.src = switcher.to;
            }
        });
    }

    function switchAllImages() {
        chrome.storage.sync.get(null, function (items) {
            var start = performance.now();
            if (items.data) {
                document.querySelectorAll('img').forEach(function (img) {
                    switchImage(img, items.data);
                });
            }
            var end = performance.now();
            console.debug("switchAllImages", "latency", end - start);
        });
    }

    switchAllImages();
    var mutationObserver = new MutationObserver(function (mutationRecordsList) {
        chrome.storage.sync.get(null, function (items) {
            var start = performance.now();
            if (items.data) {
                mutationRecordsList.forEach(function (mutationRecord) {
                    switch (mutationRecord.type) {
                        case "childList":
                            mutationRecord.addedNodes.forEach(function (addedNode) {
                                if (addedNode instanceof HTMLElement) {
                                    addedNode.querySelectorAll('img').forEach(function (img) {
                                        switchImage(img, items.data);
                                    });
                                }
                            });
                            break;
                        case "attributes":
                            if (mutationRecord.target instanceof HTMLElement) {
                                if (mutationRecord.target.tagName.toLowerCase() === "img") {
                                    switchImage(mutationRecord.target, items.data);
                                }
                            }
                            break;
                        default:
                            //DO NOTHING
                            break;
                    }
                });
            }
            var end = performance.now();
            console.debug("MutationObserver callback", "latency", end - start);
        });
    });

    var body = document.querySelector('body');
    var config = {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["src"],
    };
    mutationObserver.observe(body, config);


}());